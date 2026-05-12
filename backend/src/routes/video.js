const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { authenticate } = require('../middleware/auth');

router.get('/feed', videoController.getFeed);
router.get('/trending', videoController.getTrending);
router.get('/:id', videoController.getVideo);
router.post('/:id/like', authenticate, videoController.likeVideo);
router.post('/:id/dislike', authenticate, videoController.dislikeVideo);
router.post('/:id/report', authenticate, videoController.reportVideo);

module.exports = router;
