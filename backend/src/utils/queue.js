const Queue = require('bull');
const redis = require('../config/redis');

const videoQueue = new Queue('video processing', process.env.REDIS_URL || 'redis://localhost:6379');
const emailQueue = new Queue('email sending', process.env.REDIS_URL || 'redis://localhost:6379');
const notificationQueue = new Queue('notifications', process.env.REDIS_URL || 'redis://localhost:6379');

videoQueue.on('completed', (job, result) => {
  console.log(`Video job ${job.id} completed:`, result);
});

videoQueue.on('failed', (job, err) => {
  console.error(`Video job ${job.id} failed:`, err.message);
});

module.exports = { videoQueue, emailQueue, notificationQueue };
