require('dotenv').config();
const mongoose = require('mongoose');
const Queue = require('bull');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const Video = require('../models/Video');
const { s3, bucket } = require('../config/s3');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not defined');
  await mongoose.connect(uri);
  console.log('MongoDB Atlas connected');
};

const downloadFromB2 = async (key, localPath) => {
  const data = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  fs.writeFileSync(localPath, data.Body);
};

const uploadToB2 = async (localPath, key, contentType) => {
  await s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: fs.createReadStream(localPath),
    ContentType: contentType,
  }).promise();
};

const transcodeToHLS = (inputPath, outputDir) => {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(outputDir, { recursive: true });
    
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-preset fast',
        '-g 48',
        '-sc_threshold 0',
        '-map 0:v:0',
        '-map 0:a:0',
        '-s:v:0 1920x1080',
        '-b:v:0 5000k',
        '-map 0:v:0',
        '-map 0:a:0',
        '-s:v:1 1280x720',
        '-b:v:1 3000k',
        '-map 0:v:0',
        '-map 0:a:0',
        '-s:v:2 854x480',
        '-b:v:2 1500k',
        '-map 0:v:0',
        '-map 0:a:0',
        '-s:v:3 640x360',
        '-b:v:3 800k',
        '-f hls',
        '-hls_time 6',
        '-hls_playlist_type vod',
        '-hls_segment_filename', `${outputDir}/%v/segment_%03d.ts`,
        '-master_pl_name', 'master.m3u8',
        '-var_stream_map', 'v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3'
      ])
      .output(`${outputDir}/master.m3u8`)
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent}% done`);
      })
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
};

const startWorker = async () => {
  await connectDB();

  const videoQueue = new Queue('video processing', process.env.REDIS_URL);

  videoQueue.process('process-video', 2, async (job) => {
    const { videoId, key } = job.data;
    const localPath = `/tmp/${videoId}.mp4`;
    const outputDir = `/tmp/hls/${videoId}`;
    
    try {
      await Video.findByIdAndUpdate(videoId, { processingProgress: 10 });
      
      // Download from B2
      console.log('Downloading from B2...');
      await downloadFromB2(key, localPath);
      await Video.findByIdAndUpdate(videoId, { processingProgress: 30 });
      
      // Transcode to HLS
      console.log('Transcoding with FFmpeg...');
      await transcodeToHLS(localPath, outputDir);
      await Video.findByIdAndUpdate(videoId, { processingProgress: 70 });
      
      // Upload HLS files to B2
      console.log('Uploading HLS to B2...');
      const b2Base = `${process.env.B2_ENDPOINT}/${bucket}`;
      const files = fs.readdirSync(outputDir, { recursive: true });
      
      for (const file of files) {
        const localFilePath = path.join(outputDir, file);
        if (fs.statSync(localFilePath).isDirectory()) continue;
        
        const b2Key = `hls/${videoId}/${file}`;
        const contentType = file.endsWith('.m3u8') 
          ? 'application/vnd.apple.mpegurl' 
          : 'video/mp2t';
        
        await uploadToB2(localFilePath, b2Key, contentType);
      }
      
      // Cleanup
      fs.unlinkSync(localPath);
      fs.rmSync(outputDir, { recursive: true, force: true });
      
      // Update DB
      await Video.findByIdAndUpdate(videoId, {
        status: 'ready',
        processingProgress: 100,
        hlsUrl: `${b2Base}/hls/${videoId}/master.m3u8`,
        resolutions: [
          { resolution: '1080p', url: `${b2Base}/hls/${videoId}/master.m3u8` }
        ]
      });
      
      console.log(`Video ${videoId} processed successfully`);
      return { videoId, status: 'completed' };
      
    } catch (err) {
      // Cleanup on error
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });
      
      await Video.findByIdAndUpdate(videoId, { status: 'failed' });
      throw err;
    }
  });

  videoQueue.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed:`, result);
  });

  videoQueue.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
  });

  console.log('FFmpeg worker started...');
};

startWorker().catch(err => {
  console.error('Worker failed:', err.message);
  process.exit(1);
});

