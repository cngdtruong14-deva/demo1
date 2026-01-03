/**
 * Admin Routes
 * Admin-specific endpoints
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/rbac.middleware');

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get system statistics
 * @access  Private (Admin)
 */
router.get('/stats', authenticate, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: 'Admin stats endpoint',
    data: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV,
    },
  });
});

module.exports = router;

