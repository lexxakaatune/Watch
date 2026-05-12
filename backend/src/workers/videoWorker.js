require('dotenv').config();
const mongoose = require('mongoose');
const Queue = require('bull');
const Video = require('../models/Video');
const { s3, bucket } = require('../config/s3');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      await Video.findByIdAndUpdate(videoId, { processingProgress: 40 });
      await new Promise(resolve => setTimeout(resolve, 2000));
      await Video.findByIdAndUpdate(videoId, { processingProgress: 70 });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const baseName = key.split('/').pop().replace(/\.[^/.]+$/, '');
      const hlsUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/hls/${baseName}/master.m3u8`;
      const resolutions = [
        { resolution: '240p', url: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/hls/${baseName}/240p.m3u8` },
        { resolution: '480p', url: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/hls/${baseName}/480p.m3u8` },
        { resolution: '720p', url: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/hls/${baseName}/720p.m3u8` },
        { resolution: '1080p', url: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/hls/${baseName}/1080p.m3u8` }
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

  console.log('Video worker started and listening for jobs...');
};

startWorker().catch(err => {
  console.error('Worker failed to start:', err.message);
  process.exit(1);
});
