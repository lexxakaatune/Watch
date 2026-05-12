const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticate, requireRole } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimit');

router.post('/url', authenticate, requireRole('creator', 'admin', 'superadmin'), uploadController.getUploadUrl);
router.post('/confirm', authenticate, requireRole('creator', 'admin', 'superadmin'), uploadController.confirmUpload);
router.get('/status/:id', authenticate, uploadController.getUploadStatus);

module.exports = router;
