const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const { authenticate, requireRole } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimit');

const upload = multer({ dest: 'uploads/' });

router.post('/url', authenticate, requireRole('creator', 'admin', 'superadmin'), uploadController.getUploadUrl);
router.post('/confirm', authenticate, requireRole('creator', 'admin', 'superadmin'), uploadController.confirmUpload);
router.post('/direct', authenticate, requireRole('creator', 'admin', 'superadmin'), upload.single('video'), uploadController.directUpload);
router.get('/status/:id', authenticate, uploadController.getUploadStatus);

module.exports = router;

