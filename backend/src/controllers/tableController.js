const Table = require('../models/Table');
const Order = require('../models/Order');
const { successResponse, errorResponse } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

class TableController {
  /**
   * GET /tables/:id
   * Get table details with current order
   */
  static async getTableDetails(req, res) {
    try {
      const { id } = req.params;
      const table = await Table.findById(id);

      if (!table) {
        throw new NotFoundError('Table', id);
      }

      // Get current active order if exists
      const currentOrder = await Table.getCurrentOrder(id);

      const response = {
        id: table.id,
        table_number: table.table_number,
        branch_id: table.branch_id,
        capacity: table.capacity,
        status: table.status,
        floor_number: table.floor_number,
        zone: table.zone,
        current_order: currentOrder ? {
          id: currentOrder.id,
          order_number: currentOrder.order_number,
          status: currentOrder.order_status,
          total: parseFloat(currentOrder.total)
        } : null
      };

      return successResponse(res, response, 'Table details retrieved successfully');
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * GET /tables
   * Get all tables (with filters)
   */
  static async getTables(req, res) {
    try {
      const { branchId, status, floor } = req.query;

      if (!branchId) {
        return errorResponse(res, {
          code: 'VALIDATION_ERROR',
          message: 'branchId is required',
          details: {}
        }, 400);
      }

      const filters = {};
      if (status) filters.status = status;
      if (floor) filters.floor = parseInt(floor);

      const tables = await Table.findByBranch(branchId, filters);
      return successResponse(res, tables, 'Tables retrieved successfully');
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }
}

module.exports = TableController;

