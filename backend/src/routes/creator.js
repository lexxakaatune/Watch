const express = require('express');
const router = express.Router();
const creatorController = require('../controllers/creatorController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/dashboard', authenticate, requireRole('creator', 'admin', 'superadmin'), creatorController.getDashboard);
router.get('/analytics', authenticate, requireRole('creator', 'admin', 'superadmin'), creatorController.getAnalytics);
router.get('/earnings', authenticate, requireRole('creator', 'admin', 'superadmin'), creatorController.getEarnings);
router.put('/videos/:id', authenticate, requireRole('creator', 'admin', 'superadmin'), creatorController.updateVideo);
router.delete('/videos/:id', authenticate, requireRole('creator', 'admin', 'superadmin'), creatorController.deleteVideo);

module.exports = router;
