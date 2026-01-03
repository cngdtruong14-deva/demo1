/**
 * Customer Routes
 * Customer management endpoints
 */

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { managerOrAbove } = require('../middlewares/rbac.middleware');

/**
 * @route   GET /api/v1/customers
 * @desc    Get all customers
 * @access  Private (Manager+)
 */
router.get('/', authenticate, managerOrAbove, customerController.getAllCustomers);

/**
 * @route   GET /api/v1/customers/:id
 * @desc    Get customer by ID
 * @access  Private
 */
router.get('/:id', authenticate, customerController.getCustomerById);

/**
 * @route   POST /api/v1/customers
 * @desc    Create customer
 * @access  Public
 */
router.post('/', customerController.createCustomer);

/**
 * @route   PUT /api/v1/customers/:id
 * @desc    Update customer
 * @access  Private
 */
router.put('/:id', authenticate, customerController.updateCustomer);

module.exports = router;

