const User = require('../models/User');
const Video = require('../models/Video');
const mongoose = require('mongoose');

exports.getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password -twoFactorSecret -email');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const videos = await Video.find({ creator: user._id, status: 'ready', visibility: 'public' })
      .sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: { user, videos } });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { username, avatar, bio } = req.body;
    const updates = {};
    if (username) updates.username = username.trim();
    if (avatar) updates.avatar = avatar;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password -twoFactorSecret');
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'watchHistory.video',
      select: 'title thumbnail duration creator views createdAt',
      populate: { path: 'creator', select: 'username avatar' }
    });
    res.json({ success: true, data: { history: user.watchHistory.reverse() } });
  } catch (err) { next(err); }
};

exports.addToHistory = async (req, res, next) => {
  try {
    const { videoId, progress } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { watchHistory: { video: videoId } }
    });
    await User.findByIdAndUpdate(req.user.id, {
      $push: { watchHistory: { video: videoId, watchedAt: new Date(), progress } }
    });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.getWatchLater = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'watchLater',
      select: 'title thumbnail duration creator views createdAt',
      populate: { path: 'creator', select: 'username avatar' }
    });
    res.json({ success: true, data: { videos: user.watchLater } });
  } catch (err) { next(err); }
};

exports.toggleWatchLater = async (req, res, next) => {
  try {
    const { videoId } = req.body;
    const user = await User.findById(req.user.id);
    const exists = user.watchLater.includes(videoId);
    if (exists) {
      await User.findByIdAndUpdate(req.user.id, { $pull: { watchLater: videoId } });
      res.json({ success: true, message: 'Removed from Watch Later' });
    } else {
      await User.findByIdAndUpdate(req.user.id, { $addToSet: { watchLater: videoId } });
      res.json({ success: true, message: 'Added to Watch Later' });
    }
  } catch (err) { next(err); }
};

exports.getPlaylists = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'playlists.videos',
      select: 'title thumbnail duration'
    });
    res.json({ success: true, data: { playlists: user.playlists } });
  } catch (err) { next(err); }
};

exports.createPlaylist = async (req, res, next) => {
  try {
    const { name, isPublic } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, {
      $push: { playlists: { name, isPublic: isPublic !== false, videos: [], createdAt: new Date() } }
    }, { new: true });
    res.json({ success: true, data: { playlists: user.playlists } });
  } catch (err) { next(err); }
};

exports.subscribe = async (req, res, next) => {
  try {
    const { channelId } = req.body;
    if (channelId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot subscribe to yourself' });
    }
    const user = await User.findById(req.user.id);
    const exists = user.subscriptions.some(s => s.channel.toString() === channelId);
    if (exists) {
      await User.findByIdAndUpdate(req.user.id, { $pull: { subscriptions: { channel: channelId } } });
      await User.findByIdAndUpdate(channelId, { $pull: { followers: req.user.id } });
      res.json({ success: true, message: 'Unsubscribed' });
    } else {
      await User.findByIdAndUpdate(req.user.id, { $push: { subscriptions: { channel: channelId, subscribedAt: new Date() } } });
      await User.findByIdAndUpdate(channelId, { $addToSet: { followers: req.user.id } });
      res.json({ success: true, message: 'Subscribed' });
    }
  } catch (err) { next(err); }
};

exports.applyCreator = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, {
      $set: {
        'creatorApplication.status': 'pending',
        'creatorApplication.appliedAt': new Date(),
        'creatorApplication.reason': reason
      }
    }, { new: true });
    res.json({ success: true, data: { application: user.creatorApplication } });
  } catch (err) { next(err); }
};
