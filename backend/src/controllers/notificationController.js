const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('sender', 'username avatar');
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.updateMany({ recipient: req.user.id, isRead: false }, { $set: { isRead: true } });
      res.json({ success: true, message: 'All notifications marked as read' });
    } else {
      await Notification.findByIdAndUpdate(id, { $set: { isRead: true } });
      res.json({ success: true, message: 'Notification marked as read' });
    }
  } catch (err) { next(err); }
};
