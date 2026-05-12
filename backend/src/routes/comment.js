const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

router.get('/:videoId', commentController.getComments);
router.post('/:videoId', authenticate, commentController.addComment);
router.post('/:id/like', authenticate, commentController.likeComment);
router.post('/:id/pin', authenticate, commentController.pinComment);
router.post('/:id/report', authenticate, commentController.reportComment);

module.exports = router;
