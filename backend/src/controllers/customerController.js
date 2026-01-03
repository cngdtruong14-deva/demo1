const CustomerService = require('../services/customerService');
const { successResponse, errorResponse } = require('../utils/response');

class CustomerController {
  /**
   * POST /customers
   * Create or get customer
   */
  static async createOrGetCustomer(req, res) {
    try {
      const { phone, name, email } = req.body;

      if (!phone) {
        return errorResponse(res, {
          code: 'VALIDATION_ERROR',
          message: 'Phone number is required',
          details: {}
        }, 400);
      }

      const customer = await CustomerService.createOrGetCustomer({
        phone,
        name,
        email
      });

      return successResponse(res, customer, 'Customer retrieved successfully');
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * GET /customers/:id
   * Get customer details
   */
  static async getCustomer(req, res) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.getCustomerById(id);
      return successResponse(res, customer, 'Customer retrieved successfully');
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }
}

module.exports = CustomerController;

