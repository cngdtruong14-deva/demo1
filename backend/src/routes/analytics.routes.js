/**
 * Analytics Routes
 * Analytics and reporting endpoints
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { managerOrAbove } = require('../middlewares/rbac.middleware');

/**
 * @route   GET /api/v1/analytics/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Manager+)
 */
router.get(
  '/dashboard',
  authenticate,
  managerOrAbove,
  analyticsController.getDashboardStats
);

/**
 * @route   GET /api/v1/analytics/revenue
 * @desc    Get revenue trends
 * @access  Private (Manager+)
 */
router.get(
  '/revenue',
  authenticate,
  managerOrAbove,
  analyticsController.getRevenueTrends
);

/**
 * @route   GET /api/v1/analytics/menu-matrix
 * @desc    Get menu matrix (BCG Matrix)
 * @access  Private (Manager+)
 */
router.get(
  '/menu-matrix',
  authenticate,
  managerOrAbove,
  analyticsController.getMenuMatrix
);

/**
 * @route   GET /api/v1/analytics/heatmap
 * @desc    Get heatmap data
 * @access  Private (Manager+)
 */
router.get(
  '/heatmap',
  authenticate,
  managerOrAbove,
  analyticsController.getHeatmapData
);

module.exports = router;

