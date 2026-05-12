const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
if (!ACCESS_SECRET) throw new Error('ACCESS_TOKEN_SECRET not defined');

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'Access token required' });
    }
    const decoded = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-password -twoFactorSecret');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'User not found or deactivated' });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: `Access denied. Required roles: ${roles.join(', ')}` });
    }
    next();
  };
};

const require2FA = (req, res, next) => {
  const rolesNeeding2FA = ['creator', 'moderator', 'admin', 'superadmin'];
  if (rolesNeeding2FA.includes(req.user.role) && req.user.twoFactorEnabled && !req.session?.twoFAVerified) {
    return res.status(403).json({ success: false, error: '2FA verification required', code: '2FA_REQUIRED' });
  }
  next();
};

module.exports = { authenticate, requireRole, require2FA };
