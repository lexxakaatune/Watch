require('dotenv').config();
const mongoose = require('mongoose');
const Queue = require('bull');
const Video = require('../models/Video');
const { s3, bucket } = require('../config/s3');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not defined');
  await mongoose.connect(uri);
  console.log('MongoDB Atlas connected');
};

const startWorker = async () => {
  await connectDB();

  const videoQueue = new Queue('video processing', process.env.REDIS_URL || 'redis://localhost:6379');

  videoQueue.process('process-video', 5, async (job) => {
    const { videoId, key } = job.data;
    try {
      await Video.findByIdAndUpdate(videoId, { processingProgress: 10 });
      await new Promise(r => setTimeout(r, 2000));
      await Video.findByIdAndUpdate(videoId, { processingProgress: 40 });
      await new Promise(r => setTimeout(r, 2000));
      await Video.findByIdAndUpdate(videoId, { processingProgress: 70 });
      await new Promise(r => setTimeout(r, 2000));

      const baseName = key.split('/').pop().replace(/\.[^/.]+$/, '');
      const b2Base = `${process.env.B2_ENDPOINT}/${bucket}`;
      const hlsUrl = `${b2Base}/hls/${baseName}/master.m3u8`;
      const resolutions = [
        { resolution: '240p', url: `${b2Base}/hls/${baseName}/240p.m3u8` },
        { resolution: '480p', url: `${b2Base}/hls/${baseName}/480p.m3u8` },
        { resolution: '720p', url: `${b2Base}/hls/${baseName}/720p.m3u8` },
        { resolution: '1080p', url: `${b2Base}/hls/${baseName}/1080p.m3u8` }
      ];

      await Video.findByIdAndUpdate(videoId, {
        status: 'ready',
        processingProgress: 100,
        hlsUrl,
        resolutions
      });

      return { videoId, status: 'completed' };
    } catch (err) {
      await Video.findByIdAndUpdate(videoId, { status: 'failed' });
      throw err;
    }
  });

  videoQueue.on('completed', (job, result) => {
    console.log(`Video job ${job.id} completed:`, result);
  });

  videoQueue.on('failed', (job, err) => {
    console.error(`Video job ${job.id} failed:`, err.message);
  });

  console.log('Video worker started...');
};

startWorker().catch(err => {
  console.error('Worker failed:', err.message);
  process.exit(1);
});

