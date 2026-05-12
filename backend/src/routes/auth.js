const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, registerValidation, loginValidation } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimit');

router.post('/register', authLimiter, validate(registerValidation), authController.register);
router.post('/login', authLimiter, validate(loginValidation), authController.login);
router.post('/2fa/verify', authController.verify2FA);
router.post('/2fa/setup', authenticate, authController.setup2FA);
router.post('/2fa/confirm', authenticate, authController.confirm2FA);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
