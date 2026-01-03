/**
 * Branch Routes
 * Branch management endpoints
 */

const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/rbac.middleware');

/**
 * @route   GET /api/v1/branches
 * @desc    Get all branches
 * @access  Public
 */
router.get('/', branchController.getAllBranches);

/**
 * @route   GET /api/v1/branches/:id
 * @desc    Get branch by ID
 * @access  Public
 */
router.get('/:id', branchController.getBranchById);

/**
 * @route   POST /api/v1/branches
 * @desc    Create branch
 * @access  Private (Admin)
 */
router.post('/', authenticate, adminOnly, branchController.createBranch);

/**
 * @route   PUT /api/v1/branches/:id
 * @desc    Update branch
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, adminOnly, branchController.updateBranch);

module.exports = router;

