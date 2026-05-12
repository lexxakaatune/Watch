const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  role: {
    type: String,
    enum: ['guest', 'user', 'premium_user', 'creator', 'moderator', 'admin', 'superadmin'],
    default: 'user'
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: null },
  twoFactorEnabled: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Number, default: null },
  lastLogin: { type: Date, default: null },
  lastLoginIP: { type: String, default: null },
  trustedDevices: [{ deviceId: String, ip: String, lastUsed: Date }],
  subscriptions: [{ channel: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, subscribedAt: Date }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  watchHistory: [{ video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' }, watchedAt: Date, progress: Number }],
  playlists: [{
    name: String,
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    isPublic: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  }],
  watchLater: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  earnings: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0 },
  totalSubscribers: { type: Number, default: 0 },
  isCreatorApproved: { type: Boolean, default: false },
  creatorApplication: {
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: null },
    appliedAt: Date,
    reason: String
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  return this.updateOne(updates);
};

module.exports = mongoose.model('User', userSchema);
