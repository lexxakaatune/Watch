const User = require('../models/User');
const Video = require('../models/Video');
const Report = require('../models/Report');

exports.getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalReports = await Report.countDocuments({ status: 'pending' });
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select('username email role createdAt');
    const recentVideos = await Video.find().sort({ createdAt: -1 }).limit(10).populate('creator', 'username');
    res.json({
      success: true,
      data: { stats: { totalUsers, totalVideos, totalReports }, recentUsers, recentVideos }
    });
  } catch (err) { next(err); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const users = await User.find(query)
      .select('-password -twoFactorSecret')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, data: { users, total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const validRoles = ['user', 'premium_user', 'creator', 'moderator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password -twoFactorSecret');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
};

exports.suspendUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { duration } = req.body;
    const lockUntil = duration ? Date.now() + duration * 60 * 60 * 1000 : null;
    const user = await User.findByIdAndUpdate(id, { isActive: !duration, lockUntil }, { new: true });
    res.json({ success: true, message: duration ? `User suspended for ${duration} hours` : 'User unsuspended', data: { user } });
  } catch (err) { next(err); }
};

exports.getCreatorApplications = async (req, res, next) => {
  try {
    const users = await User.find({ 'creatorApplication.status': 'pending' })
      .select('username email creatorApplication avatar')
      .sort({ 'creatorApplication.appliedAt': -1 });
    res.json({ success: true, data: { applications: users } });
  } catch (err) { next(err); }
};

exports.approveCreator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approve } = req.body;
    const user = await User.findByIdAndUpdate(id, {
      role: approve ? 'creator' : 'user',
      isCreatorApproved: approve,
      'creatorApplication.status': approve ? 'approved' : 'rejected'
    }, { new: true });
    res.json({ success: true, message: approve ? 'Creator approved' : 'Application rejected', data: { user } });
  } catch (err) { next(err); }
};

exports.getReports = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const reports = await Report.find({ status })
      .sort({ createdAt: -1 })
      .populate('reporter', 'username')
      .limit(50);
    res.json({ success: true, data: { reports } });
  } catch (err) { next(err); }
};

exports.resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const report = await Report.findByIdAndUpdate(id, {
      status: 'resolved',
      actionTaken: action,
      reviewedBy: req.user.id,
      reviewedAt: new Date()
    }, { new: true });
    res.json({ success: true, data: { report } });
  } catch (err) { next(err); }
};
