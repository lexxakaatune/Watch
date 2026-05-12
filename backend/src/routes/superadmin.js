const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/system-health', authenticate, requireRole('superadmin'), async (req, res) => {
  res.json({ success: true, data: { status: 'healthy', uptime: process.uptime(), memory: process.memoryUsage() } });
});

router.get('/admins', authenticate, requireRole('superadmin'), async (req, res, next) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'moderator'] } }).select('-password -twoFactorSecret');
    res.json({ success: true, data: { admins } });
  } catch (err) { next(err); }
});

router.put('/admins/:id/role', authenticate, requireRole('superadmin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password -twoFactorSecret');
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
});

module.exports = router;
