const Video = require('../models/Video');
const User = require('../models/User');
const Comment = require('../models/Comment');

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
