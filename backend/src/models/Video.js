const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 5000 },
  thumbnail: { type: String, required: true },
  videoUrl: { type: String, required: true },
  videoKey: { type: String, required: true},
  hlsUrl: { type: String, default: null },
  duration: { type: Number, default: 0 },
  resolutions: [{ resolution: String, url: String }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, default: 'general' },
  tags: [{ type: String }],
  visibility: { type: String, enum: ['public', 'unlisted', 'private'], default: 'public' },
  status: { type: String, enum: ['uploading', 'processing', 'ready', 'failed', 'flagged'], default: 'uploading' },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  isPremium: { type: Boolean, default: false },
  isShort: { type: Boolean, default: false },
  processingProgress: { type: Number, default: 0 },
  monetization: {
    enabled: { type: Boolean, default: false },
    adBreaks: [{ time: Number, type: String }]
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    structuredData: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

videoSchema.index({ createdAt: -1 });
videoSchema.index({ views: -1 });
videoSchema.index({ tags: 1 });

module.exports = mongoose.model('Video', videoSchema);
