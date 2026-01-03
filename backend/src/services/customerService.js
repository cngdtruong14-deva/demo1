const Customer = require('../models/Customer');
const { NotFoundError, DuplicateEntryError } = require('../utils/errors');

class CustomerService {
  /**
   * Create or get customer by phone
   */
  static async createOrGetCustomer(customerData) {
    const { phone, name, email } = customerData;

    // Check if customer exists
    let customer = await Customer.findByPhone(phone);

    if (customer) {
      // Update customer info if provided
      if (name || email) {
        customer = await Customer.update(customer.id, { name, email });
      }
      return customer;
    }

    // Create new customer
    customer = await Customer.create({ phone, name, email });
    return customer;
  }

  /**
   * Get customer by ID with stats
   */
  static async getCustomerById(customerId) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new NotFoundError('Customer', customerId);
    }

    const stats = await Customer.getStats(customerId);

    return {
      id: customer.id,
      phone: customer.phone,
      name: customer.name,
      email: customer.email,
      segment: customer.segment_name ? {
        id: customer.segment_id,
        name: customer.segment_name,
        color: customer.segment_color,
        discountPercentage: parseFloat(customer.segment_discount || 0)
      } : null,
      stats: {
        totalOrders: parseInt(stats.total_orders || 0),
        totalSpent: parseFloat(stats.total_spent || 0),
        avgOrderValue: parseFloat(stats.avg_order_value || 0),
        lastOrderDate: stats.last_order_date
      }
    };
  }

  /**
   * Update customer stats after order
   */
  static async updateCustomerStats(customerId, orderTotal) {
    if (!customerId) return;
    await Customer.updateStats(customerId, orderTotal);
  }
}

module.exports = CustomerService;

