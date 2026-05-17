const Video = require('../models/Video');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { s3, bucket } = require('../config/s3');

exports.getFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const query = { status: 'ready', visibility: 'public' };
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('creator', 'username avatar totalSubscribers');
    const total = await Video.countDocuments(query);
    res.json({ success: true, data: { videos, total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.getTrending = async (req, res, next) => {
  try {
    const videos = await Video.find({ status: 'ready', visibility: 'public' })
      .sort({ views: -1, createdAt: -1 })
      .limit(20)
      .populate('creator', 'username avatar');
    res.json({ success: true, data: { videos } });
  } catch (err) { next(err); }
};

exports.getVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await Video.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .populate('creator', 'username avatar totalSubscribers')
      .populate({
        path: 'comments',
        populate: [
          { path: 'user', select: 'username avatar' },
          { path: 'replies', populate: { path: 'user', select: 'username avatar' } }
        ]
      });
    if (!video) return res.status(404).json({ success: false, error: 'Video not found' });
    if (video.visibility === 'private' && (!req.user || video.creator._id.toString() !== req.user.id)) {
      return res.status(403).json({ success: false, error: 'This video is private' });
    }
    const related = await Video.find({
      _id: { $ne: id },
      status: 'ready',
      visibility: 'public',
      $or: [{ category: video.category }, { tags: { $in: video.tags } }]
    }).limit(10).populate('creator', 'username avatar');
    res.json({ success: true, data: { video, related } });
  } catch (err) { next(err); }
};

exports.likeVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ success: false, error: 'Video not found' });
    const hasLike = video.likes.includes(req.user.id);
    const hasDislike = video.dislikes.includes(req.user.id);
    if (hasLike) {
      await Video.findByIdAndUpdate(id, { $pull: { likes: req.user.id } });
      res.json({ success: true, message: 'Like removed' });
    } else {
      const update = { $addToSet: { likes: req.user.id } };
      if (hasDislike) update.$pull = { dislikes: req.user.id };
      await Video.findByIdAndUpdate(id, update);
      res.json({ success: true, message: 'Liked' });
    }
  } catch (err) { next(err); }
};

exports.dislikeVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ success: false, error: 'Video not found' });
    const hasDislike = video.dislikes.includes(req.user.id);
    const hasLike = video.likes.includes(req.user.id);
    if (hasDislike) {
      await Video.findByIdAndUpdate(id, { $pull: { dislikes: req.user.id } });
      res.json({ success: true, message: 'Dislike removed' });
    } else {
      const update = { $addToSet: { dislikes: req.user.id } };
      if (hasLike) update.$pull = { likes: req.user.id };
      await Video.findByIdAndUpdate(id, update);
      res.json({ success: true, message: 'Disliked' });
    }
  } catch (err) { next(err); }
};

exports.streamVideo = async (req, res, next) => {
  try {
    const key = req.params.key;
    console.log('Key:', key);
    
    const headRes = await s3.headObject({ Bucket: bucket, Key: key }).promise();
    console.log('Head success:', headRes.ContentType, headRes.ContentLength);
    
    res.setHeader('Content-Type', headRes.ContentType || 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', headRes.ContentLength);
    
    const stream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream();
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      next(err);
    });
    stream.pipe(res);
    
    console.log('Response sent');
  } catch (err) { 
    console.error('Controller error:', err.message);
    next(err); 
  }
};


/*
exports.streamVideo = async (req, res, next) => {
  try {
    const key = req.params.key;
    console.log('1. Key:', key);
    
    const headRes = await s3.headObject({ Bucket: bucket, Key: key }).promise();
    console.log('2. Head success:', headRes.ContentType, headRes.ContentLength);
    
    const range = req.headers.range;
    console.log('3. Range:', range);

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : undefined;
      const fileSize = headRes.ContentLength;
      const endByte = end || fileSize - 1;
      const chunksize = (endByte - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${endByte}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': headRes.ContentType,
      });

      const stream = s3.getObject({ Bucket: bucket, Key: key, Range: range }).createReadStream();
      stream.pipe(res);
    } else {
      res.setHeader('Content-Type', headRes.ContentType || 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      const stream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream();
      stream.pipe(res);
    }
    console.log('4. Response sent');
  } catch (err) { 
    console.error('5. Stream error:', err.message);
    next(err); 
  }
};
*/
/*
exports.streamVideo = async (req, res, next) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const range = req.headers.range;

    console.log('Raw key:', req.params.key);
    console.log('Decoded key:', decodeURIComponent(req.params.key));

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : undefined;
      
      const headRes = await s3.headObject({ Bucket: bucket, Key: key }).promise();
      const fileSize = headRes.ContentLength;
      const endByte = end || fileSize - 1;
      const chunksize = (endByte - start) + 1;
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${endByte}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': headRes.ContentType,
      });
      
      const stream = s3.getObject({ Bucket: bucket, Key: key, Range: range }).createReadStream();
      stream.pipe(res);
    } else {
      const headRes = await s3.headObject({ Bucket: bucket, Key: key }).promise();
      res.setHeader('Content-Type', headRes.ContentType || 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      const stream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream();
      stream.pipe(res);
    }
  } catch (err) { next(err); }
};
*/

exports.reportVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;
    const Report = require('../models/Report');
    await Report.create({
      reporter: req.user.id,
      targetType: 'video',
      targetId: id,
      reason,
      details
    });
    res.json({ success: true, message: 'Report submitted' });
  } catch (err) { next(err); }
};
