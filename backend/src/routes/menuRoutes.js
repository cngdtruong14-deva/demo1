const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/menuController');
const { param } = require('express-validator');
const { validate, optionalAuth } = require('../middlewares');

// Validation
const branchIdValidator = [
  param('branchId')
    .isUUID()
    .withMessage('Invalid branch ID format')
];

/**
 * GET /menu/:branchId
 * Get full menu with nested structure
 * Query params: status, search, hideEmpty
 */
router.get(
  '/:branchId',
  optionalAuth,
  branchIdValidator,
  validate,
  MenuController.getMenu
);

/**
 * GET /menu/:branchId/summary
 * Get menu summary (categories only)
 */
router.get(
  '/:branchId/summary',
  optionalAuth,
  branchIdValidator,
  validate,
  MenuController.getMenuSummary
);

module.exports = router;

