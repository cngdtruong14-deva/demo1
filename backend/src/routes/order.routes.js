/**
 * Order Routes
 * Order management endpoints
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { orderLimiter } = require('../middlewares/rateLimiter.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { createOrderSchema } = require('../validators/order.validator');

/**
 * @route   POST /api/v1/orders
 * @desc    Create new order
 * @access  Public
 */
router.post(
  '/',
  orderLimiter,
  validateBody(createOrderSchema),
  orderController.createOrder
);

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders
 * @access  Private
 */
router.get('/', authenticate, orderController.getAllOrders);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', authenticate, orderController.getOrderById);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Private
 */
router.patch('/:id/status', authenticate, orderController.updateOrderStatus);

/**
 * @route   PATCH /api/v1/orders/:orderId/items/:itemId/status
 * @desc    Update order item status
 * @access  Private (Kitchen)
 */
router.patch(
  '/:orderId/items/:itemId/status',
  authenticate,
  orderController.updateOrderItemStatus
);

/**
 * @route   GET /api/v1/orders/kitchen/:branchId
 * @desc    Get kitchen orders
 * @access  Private (Kitchen)
 */
router.get('/kitchen/:branchId', authenticate, orderController.getKitchenOrders);

module.exports = router;

