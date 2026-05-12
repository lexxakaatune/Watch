const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/profile/:username', userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/history', authenticate, userController.getHistory);
router.post('/history', authenticate, userController.addToHistory);
router.get('/watch-later', authenticate, userController.getWatchLater);
router.post('/watch-later', authenticate, userController.toggleWatchLater);
router.get('/playlists', authenticate, userController.getPlaylists);
router.post('/playlists', authenticate, userController.createPlaylist);
router.post('/subscribe', authenticate, userController.subscribe);
router.post('/apply-creator', authenticate, userController.applyCreator);

module.exports = router;
