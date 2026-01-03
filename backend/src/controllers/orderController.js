const OrderService = require('../services/orderService');
const { successResponse, errorResponse } = require('../utils/response');

class OrderController {
  /**
   * POST /orders
   * Create a new order
   */
  static async createOrder(req, res) {
    try {
      const { tableId, customerId, items, notes } = req.body;

      if (!tableId) {
        return errorResponse(
          res,
          {
            code: 'VALIDATION_ERROR',
            message: 'tableId is required',
            details: {}
          },
          400
        );
      }

      if (!items || items.length === 0) {
        return errorResponse(
          res,
          {
            code: 'VALIDATION_ERROR',
            message: 'Order must have at least one item',
            details: {}
          },
          400
        );
      }

      const order = await OrderService.createOrder({
        tableId,
        customerId: customerId || null,
        items,
        notes: notes || null
      });

      // Calculate estimated time
      const estimatedTime = 20; // TODO: Calculate based on items

      return successResponse(
        res,
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          tableNumber: order.table.tableNumber,
          subtotal: order.subtotal,
          discount: order.discount,
          tax: order.tax,
          total: order.total,
          status: order.orderStatus,
          estimatedTime
        },
        'Order created successfully',
        201
      );
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * GET /orders/:id
   * Get order details
   */
  static async getOrder(req, res) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(id);
      return successResponse(res, order, 'Order retrieved successfully');
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * GET /orders/:id/status
   * Get order status (simplified)
   */
  static async getOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const status = await OrderService.getOrderStatus(id);
      return successResponse(res, status, 'Order status retrieved successfully');
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * PATCH /orders/:id/status
   * Update order status
   */
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return errorResponse(
          res,
          {
            code: 'VALIDATION_ERROR',
            message: 'status is required',
            details: {}
          },
          400
        );
      }

      const order = await OrderService.updateOrderStatus(id, status, notes);
      return successResponse(res, order, 'Order status updated successfully');
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }
}

module.exports = OrderController;
