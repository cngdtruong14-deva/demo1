/**
 * Analytics Service
 * Business intelligence calculations
 */

const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Calculate revenue for period
 */
async function calculateRevenue(branchId, startDate, endDate) {
  const [result] = await query(
    `SELECT 
      COUNT(*) as total_orders,
      SUM(total) as total_revenue,
      SUM(discount) as total_discount,
      AVG(total) as avg_order_value
     FROM orders
     WHERE branch_id = ?
       AND order_status = 'completed'
       AND created_at BETWEEN ? AND ?`,
    [branchId, startDate, endDate]
  );

  return result;
}

/**
 * Get customer lifetime value
 */
async function getCustomerLTV(customerId) {
  const [result] = await query(
    `SELECT 
      COUNT(*) as total_orders,
      SUM(total) as total_spent,
      AVG(total) as avg_order_value,
      DATEDIFF(NOW(), MIN(created_at)) as customer_age_days
     FROM orders
     WHERE customer_id = ?
       AND order_status = 'completed'`,
    [customerId]
  );

  return result;
}

module.exports = {
  calculateRevenue,
  getCustomerLTV,
};

