const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

router.get('/conversations', authenticate, messageController.getConversations);
router.get('/:userId', authenticate, messageController.getMessages);
router.post('/:userId', authenticate, messageController.sendMessage);

module.exports = router;
