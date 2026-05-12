const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getConversations = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    }).sort({ createdAt: -1 }).populate('sender receiver', 'username avatar');
    const conversations = {};
    messages.forEach(msg => {
      const otherId = msg.sender._id.toString() === req.user.id ? msg.receiver._id.toString() : msg.sender._id.toString();
      if (!conversations[otherId]) conversations[otherId] = { user: msg.sender._id.toString() === req.user.id ? msg.receiver : msg.sender, lastMessage: msg, unread: 0 };
      if (!msg.isRead && msg.receiver._id.toString() === req.user.id) conversations[otherId].unread++;
    });
    res.json({ success: true, data: { conversations: Object.values(conversations) } });
  } catch (err) { next(err); }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ],
      isDeleted: false
    }).sort({ createdAt: 1 }).populate('sender receiver', 'username avatar');
    await Message.updateMany({ sender: userId, receiver: req.user.id, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
    res.json({ success: true, data: { messages } });
  } catch (err) { next(err); }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { text, mediaUrl, mediaType } = req.body;
    const message = await Message.create({
      sender: req.user.id,
      receiver: userId,
      text,
      mediaUrl,
      mediaType
    });
    await Notification.create({
      recipient: userId,
      sender: req.user.id,
      type: 'message',
      title: 'New Message',
      message: `${req.user.username} sent you a message`,
      link: `/messages`
    });
    const populated = await Message.findById(message._id).populate('sender receiver', 'username avatar');
    res.status(201).json({ success: true, data: { message: populated } });
  } catch (err) { next(err); }
};
