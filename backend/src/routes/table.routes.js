/**
 * Table Routes
 * Table management endpoints
 */

const express = require('express');
const router = express.Router();
const tableController = require('../controllers/table.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { managerOrAbove } = require('../middlewares/rbac.middleware');

/**
 * @route   GET /api/v1/tables
 * @desc    Get all tables
 * @access  Public
 */
router.get('/', tableController.getAllTables);

/**
 * @route   GET /api/v1/tables/:id
 * @desc    Get table by ID
 * @access  Public
 */
router.get('/:id', tableController.getTableById);

/**
 * @route   POST /api/v1/tables
 * @desc    Create table
 * @access  Private (Manager+)
 */
router.post('/', authenticate, managerOrAbove, tableController.createTable);

/**
 * @route   PATCH /api/v1/tables/:id/status
 * @desc    Update table status
 * @access  Private
 */
router.patch('/:id/status', authenticate, tableController.updateTableStatus);

/**
 * @route   DELETE /api/v1/tables/:id
 * @desc    Delete table
 * @access  Private (Manager+)
 */
router.delete('/:id', authenticate, managerOrAbove, tableController.deleteTable);

module.exports = router;

