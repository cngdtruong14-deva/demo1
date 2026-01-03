const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');

// POST / - Create a new order
router.post('/', OrderController.createOrder);

// GET /:id - Get order details
router.get('/:id', OrderController.getOrder);

// GET /:id/status - Get order status (simplified)
router.get('/:id/status', OrderController.getOrderStatus);

// PATCH /:id/status - Update order status
router.patch('/:id/status', OrderController.updateOrderStatus);

module.exports = router;
