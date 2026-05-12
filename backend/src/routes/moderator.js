const express = require('express');
const router = express.Router();
const moderatorController = require('../controllers/moderatorController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/dashboard', authenticate, requireRole('moderator', 'admin', 'superadmin'), moderatorController.getDashboard);
router.get('/uploads', authenticate, requireRole('moderator', 'admin', 'superadmin'), moderatorController.getPendingUploads);
router.post('/videos/:id', authenticate, requireRole('moderator', 'admin', 'superadmin'), moderatorController.moderateVideo);
router.post('/comments/:id', authenticate, requireRole('moderator', 'admin', 'superadmin'), moderatorController.moderateComment);
router.post('/users/:id/suspend', authenticate, requireRole('moderator', 'admin', 'superadmin'), moderatorController.suspendUser);

module.exports = router;
