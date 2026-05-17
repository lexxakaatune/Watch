const Video = require('../models/Video');
const { s3, bucket } = require('../config/s3');
const { videoQueue } = require('../utils/queue');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

exports.directUpload = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: 'No video file provided' });
    
    const key = `uploads/${req.user.id}/${uuidv4()}-${file.originalname}`;
    
    await s3.putObject({
      Bucket: bucket,
      Key: key,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype,
    }).promise();
    
    fs.unlinkSync(file.path);

    const baseName = key.split('/').pop().replace(/\.[^/.]+$/, '');
    const b2Base = `${process.env.B2_ENDPOINT}/${bucket}`;
    const videoUrl = `${b2Base}/${key}`;
    const thumbnail = `${b2Base}/thumbnails/${baseName}.jpg`;

    
    const video = await Video.create({
      title: req.body.title,
      description: req.body.description || '',
      thumbnail,
      videoUrl,
      videoKey: key,
      creator: req.user.id,
      category: req.body.category || 'general',
      tags: req.body.tags?.split(',').map(t => t.trim()).filter(Boolean) || [],
      visibility: req.body.visibility || 'public',
      // status: 'processing'
      status: 'ready'
    });
    
    videoQueue.add('process-video', {
      videoId: video._id.toString(),
      key,
      userId: req.user.id
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true
    });
    
    res.json({ success: true, data: { video } });
  } catch (err) { 
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(err); 
  }
};


exports.getUploadUrl = async (req, res, next) => {
  try {
    const { filename, contentType } = req.body;
    const key = `uploads/${req.user.id}/${uuidv4()}-${filename}`;
    const params = {
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      Expires: 300
    };
    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    res.json({ success: true, data: { uploadUrl, key } });
  } catch (err) { next(err); }
};

exports.confirmUpload = async (req, res, next) => {
  try {
    const { key, title, description, visibility, tags, category, isShort } = req.body;
    const videoUrl = `${process.env.B2_ENDPOINT}/${bucket}/${key}`;
    const thumbnail = `${process.env.B2_ENDPOINT}/${bucket}/thumbnails/${key.split('/').pop().replace(/\.[^/.]+$/, '')}.jpg`;
    const video = await Video.create({
      title,
      description,
      thumbnail,
      videoUrl,
      creator: req.user.id,
      category: category || 'general',
      tags: tags || [],
      visibility: visibility || 'public',
      isShort: isShort || false,
      status: 'processing'
    });
    videoQueue.add('process-video', {
      videoId: video._id.toString(),
      key,
      userId: req.user.id
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true
    });
    res.json({ success: true, data: { video } });
  } catch (err) { next(err); }
};

exports.getUploadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id).select('status processingProgress hlsUrl resolutions');
    if (!video) return res.status(404).json({ success: false, error: 'Video not found' });
    res.json({ success: true, data: { status: video.status, progress: video.processingProgress, hlsUrl: video.hlsUrl, resolutions: video.resolutions } });
  } catch (err) { next(err); }
};
