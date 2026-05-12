const Comment = require('../models/Comment');
const Video = require('../models/Video');
const Notification = require('../models/Notification');

exports.getComments = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { sort = 'newest' } = req.query;
    let sortOption = { createdAt: -1 };
    if (sort === 'top') sortOption = { 'likes.length': -1 };
    const comments = await Comment.find({ video: videoId, parentComment: null })
      .sort(sortOption)
      .populate('user', 'username avatar')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'username avatar' }
      });
    res.json({ success: true, data: { comments } });
  } catch (err) { next(err); }
};

exports.addComment = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { text, parentCommentId } = req.body;
    const comment = await Comment.create({
      video: videoId,
      user: req.user.id,
      text,
      parentComment: parentCommentId || null
    });
    await Video.findByIdAndUpdate(videoId, { $push: { comments: comment._id } });
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, { $push: { replies: comment._id } });
    }
    const video = await Video.findById(videoId).populate('creator');
    if (video.creator._id.toString() !== req.user.id) {
      await Notification.create({
        recipient: video.creator._id,
        sender: req.user.id,
        type: 'comment',
        title: 'New Comment',
        message: `${req.user.username} commented on your video`,
        link: `/watch/${videoId}`
      });
    }
    const populated = await Comment.findById(comment._id).populate('user', 'username avatar');
    res.status(201).json({ success: true, data: { comment: populated } });
  } catch (err) { next(err); }
};

exports.likeComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ success: false, error: 'Comment not found' });
    const hasLike = comment.likes.includes(req.user.id);
    if (hasLike) {
      await Comment.findByIdAndUpdate(id, { $pull: { likes: req.user.id } });
      res.json({ success: true, message: 'Like removed' });
    } else {
      await Comment.findByIdAndUpdate(id, { $addToSet: { likes: req.user.id }, $pull: { dislikes: req.user.id } });
      res.json({ success: true, message: 'Liked' });
    }
  } catch (err) { next(err); }
};

exports.pinComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id).populate('video');
    if (!comment) return res.status(404).json({ success: false, error: 'Comment not found' });
    if (comment.video.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only video creator can pin comments' });
    }
    await Comment.updateMany({ video: comment.video._id }, { $set: { isPinned: false } });
    await Comment.findByIdAndUpdate(id, { $set: { isPinned: true } });
    res.json({ success: true, message: 'Comment pinned' });
  } catch (err) { next(err); }
};

exports.reportComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const Report = require('../models/Report');
    await Report.create({ reporter: req.user.id, targetType: 'comment', targetId: id, reason });
    res.json({ success: true, message: 'Comment reported' });
  } catch (err) { next(err); }
};
