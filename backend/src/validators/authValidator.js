const { body } = require('express-validator');

const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .notEmpty()
    .withMessage('Email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .notEmpty()
    .withMessage('Password is required')
];

const refreshValidator = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

module.exports = {
  loginValidator,
  refreshValidator
};

