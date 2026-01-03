const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { loginValidator, refreshValidator } = require('../validators/authValidator');
const { validate, authenticate, authLimiter } = require('../middlewares');

router.post('/login', authLimiter, loginValidator, validate, AuthController.login);
router.post('/refresh', refreshValidator, validate, AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);

module.exports = router;

