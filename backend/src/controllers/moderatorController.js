const Report = require('../models/Report');
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const User = require('../models/User');

exports.getDashboard = async (req, res, next) => {
  try {
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const flaggedVideos = await Video.countDocuments({ status: 'flagged' });
    const recentReports = await Report.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('reporter', 'username');
    res.json({ success: true, data: { stats: { pendingReports, flaggedVideos }, recentReports } });
  } catch (err) { next(err); }
};

exports.getPendingUploads = async (req, res, next) => {
  try {
    const videos = await Video.find({ status: { $in: ['processing', 'flagged'] } })
      .sort({ createdAt: -1 })
      .populate('creator', 'username avatar')
      .limit(50);
    res.json({ success: true, data: { videos } });
  } catch (err) { next(err); }
};

exports.moderateVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    let update = {};
    if (action === 'approve') update = { status: 'ready' };
    if (action === 'reject') update = { status: 'failed' };
    if (action === 'flag') update = { status: 'flagged' };
    const video = await Video.findByIdAndUpdate(id, update, { new: true });
    if (!video) return res.status(404).json({ success: false, error: 'Video not found' });
    res.json({ success: true, message: `Video ${action}d`, data: { video } });
  } catch (err) { next(err); }
};

exports.moderateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    if (action === 'delete') {
      await Comment.findByIdAndDelete(id);
      res.json({ success: true, message: 'Comment deleted' });
    } else {
      res.json({ success: true, message: 'No action taken' });
    }
  } catch (err) { next(err); }
};

exports.suspendUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { duration, reason } = req.body;
    if (!duration || duration > 168) {
      return res.status(400).json({ success: false, error: 'Max suspension is 7 days (168 hours)' });
    }
    const user = await User.findByIdAndUpdate(id, {
      lockUntil: Date.now() + duration * 60 * 60 * 1000
    }, { new: true });
    res.json({ success: true, message: `User suspended for ${duration} hours`, data: { user } });
  } catch (err) { next(err); }
};
