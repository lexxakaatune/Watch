const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 15 * 60 * 1000
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Username or email already exists' });
    }
    const user = await User.create({ username, email, password, role: 'user' });
    const { accessToken, refreshToken } = generateTokens(user._id);
    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    if (user.isLocked()) {
      return res.status(423).json({ success: false, error: 'Account locked due to too many failed attempts. Try again in 2 hours' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    if (user.loginAttempts > 0) {
      await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
    }
    user.lastLogin = new Date();
    user.lastLoginIP = req.ip;
    await user.save();
    const { accessToken, refreshToken } = generateTokens(user._id);
    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    const needs2FA = ['creator', 'moderator', 'admin', 'superadmin'].includes(user.role) && user.twoFactorEnabled;
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          twoFactorEnabled: user.twoFactorEnabled
        },
        requires2FA: needs2FA
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.verify2FA = async (req, res, next) => {
  try {
    const { email, token } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, error: '2FA not configured for this user' });
    }
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    });
    if (!verified) {
      return res.status(401).json({ success: false, error: 'Invalid 2FA code' });
    }
    const { accessToken, refreshToken } = generateTokens(user._id);
    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.setup2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const secret = speakeasy.generateSecret({ name: `Watch (${user.email})` });
    user.twoFactorSecret = secret.base32;
    await user.save();
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.confirm2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, error: '2FA setup not initiated' });
    }
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    });
    if (!verified) {
      return res.status(401).json({ success: false, error: 'Invalid 2FA code. Setup failed' });
    }
    user.twoFactorEnabled = true;
    await user.save();
    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, error: 'Refresh token required' });
    }
    const decoded = verifyRefreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
    res.json({ success: true, message: 'Tokens refreshed' });
  } catch (err) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    next(err);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('accessToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' });
  res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' });
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -twoFactorSecret');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          twoFactorEnabled: user.twoFactorEnabled,
          isCreatorApproved: user.isCreatorApproved,
          totalSubscribers: user.totalSubscribers,
          totalViews: user.totalViews
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
