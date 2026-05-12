const Video = require('../models/Video');
const User = require('../models/User');

exports.getDashboard = async (req, res, next) => {
  try {
    const videos = await Video.find({ creator: req.user.id }).sort({ createdAt: -1 });
    const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
    const totalLikes = videos.reduce((sum, v) => sum + v.likes.length, 0);
    const stats = {
      totalVideos: videos.length,
      totalViews,
      totalLikes,
      totalSubscribers: req.user.totalSubscribers || 0,
      earnings: req.user.earnings || 0
    };
    res.json({ success: true, data: { stats, videos } });
  } catch (err) { next(err); }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const videos = await Video.find({
      creator: req.user.id,
      createdAt: { $gte: thirtyDaysAgo }
    }).select('views likes createdAt title');
    const dailyViews = {};
    videos.forEach(v => {
      const date = v.createdAt.toISOString().split('T')[0];
      dailyViews[date] = (dailyViews[date] || 0) + v.views;
    });
    res.json({ success: true, data: { videos, dailyViews } });
  } catch (err) { next(err); }
};

exports.getEarnings = async (req, res, next) => {
  try {
    res.json({ success: true, data: { earnings: req.user.earnings || 0, pending: 0, paid: 0 } });
  } catch (err) { next(err); }
};

exports.updateVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, visibility, tags } = req.body;
    const video = await Video.findOneAndUpdate(
      { _id: id, creator: req.user.id },
      { title, description, visibility, tags },
      { new: true }
    );
    if (!video) return res.status(404).json({ success: false, error: 'Video not found or not yours' });
    res.json({ success: true, data: { video } });
  } catch (err) { next(err); }
};

exports.deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await Video.findOneAndDelete({ _id: id, creator: req.user.id });
    if (!video) return res.status(404).json({ success: false, error: 'Video not found or not yours' });
    res.json({ success: true, message: 'Video deleted' });
  } catch (err) { next(err); }
};
