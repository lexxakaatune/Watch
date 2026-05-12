const { body, param, query, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
  };
};

const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];

const videoUploadValidation = [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title required, max 100 chars'),
  body('description').optional().trim().isLength({ max: 5000 }).withMessage('Description max 5000 chars'),
  body('visibility').optional().isIn(['public', 'unlisted', 'private']).withMessage('Invalid visibility'),
  body('tags').optional().isArray({ max: 20 }).withMessage('Max 20 tags')
];

module.exports = { validate, registerValidation, loginValidation, videoUploadValidation };
