/**
 * Analytics Controller
 * Business intelligence and reporting
 */

const { query } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/responseFormatter');
const { todayRange, thisWeekRange, thisMonthRange } = require('../utils/dateHelper');
const logger = require('../utils/logger');

/**
 * @route   GET /api/v1/analytics/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin/Manager)
 */
async function getDashboardStats(req, res, next) {
  try {
    const { branch_id, period = 'today' } = req.query;

    let dateRange;
    switch (period) {
      case 'week':
        dateRange = thisWeekRange();
        break;
      case 'month':
        dateRange = thisMonthRange();
        break;
      default:
        dateRange = todayRange();
    }

    const branchCondition = branch_id ? 'AND branch_id = ?' : '';
    const params = branch_id ? [dateRange.start, dateRange.end, branch_id] : [dateRange.start, dateRange.end];

    // Total revenue
    const [revenueResult] = await query(
      `SELECT 
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(SUM(discount), 0) as total_discount,
        COUNT(*) as total_orders,
        COALESCE(AVG(total), 0) as avg_order_value
       FROM orders
       WHERE created_at BETWEEN ? AND ?
         AND order_status = 'completed'
         ${branchCondition}`,
      params
    );

    // Active orders
    const [activeOrders] = await query(
      `SELECT COUNT(*) as count
       FROM orders
       WHERE order_status IN ('pending', 'confirmed', 'preparing')
         ${branchCondition.replace('AND', 'AND')}`,
      branch_id ? [branch_id] : []
    );

    // Top products
    const topProducts = await query(
      `SELECT 
        p.name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.created_at BETWEEN ? AND ?
         AND o.order_status = 'completed'
         ${branchCondition}
       GROUP BY p.id, p.name
       ORDER BY total_sold DESC
       LIMIT 5`,
      params
    );

    // Customer stats
    const [customerStats] = await query(
      `SELECT 
        COUNT(DISTINCT customer_id) as unique_customers,
        COUNT(DISTINCT CASE WHEN customer_id IN (
          SELECT customer_id FROM orders 
          WHERE created_at < ? 
          GROUP BY customer_id
        ) THEN customer_id END) as returning_customers
       FROM orders
       WHERE created_at BETWEEN ? AND ?
         ${branchCondition}`,
      branch_id ? [dateRange.start, dateRange.start, dateRange.end, branch_id] : [dateRange.start, dateRange.start, dateRange.end]
    );

    return sendSuccess(
      res,
      {
        revenue: revenueResult,
        active_orders: activeOrders.count,
        top_products: topProducts,
        customers: customerStats,
      },
      'Dashboard stats retrieved successfully'
    );
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    next(error);
  }
}

/**
 * @route   GET /api/v1/analytics/revenue
 * @desc    Get revenue trends
 * @access  Private (Admin/Manager)
 */
async function getRevenueTrends(req, res, next) {
  try {
    const { branch_id, period = 'daily', from_date, to_date } = req.query;

    const branchCondition = branch_id ? 'AND branch_id = ?' : '';
    const params = [from_date, to_date];
    if (branch_id) params.push(branch_id);

    let groupBy;
    switch (period) {
      case 'hourly':
        groupBy = 'DATE_FORMAT(created_at, "%Y-%m-%d %H:00")';
        break;
      case 'weekly':
        groupBy = 'YEARWEEK(created_at)';
        break;
      case 'monthly':
        groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
        break;
      default:
        groupBy = 'DATE(created_at)';
    }

    const trends = await query(
      `SELECT 
        ${groupBy} as period,
        COUNT(*) as order_count,
        SUM(total) as revenue,
        SUM(discount) as discount,
        AVG(total) as avg_order_value
       FROM orders
       WHERE DATE(created_at) BETWEEN ? AND ?
         AND order_status = 'completed'
         ${branchCondition}
       GROUP BY period
       ORDER BY period ASC`,
      params
    );

    return sendSuccess(res, trends, 'Revenue trends retrieved successfully');
  } catch (error) {
    logger.error('Get revenue trends error:', error);
    next(error);
  }
}

/**
 * @route   GET /api/v1/analytics/menu-matrix
 * @desc    Get menu matrix (BCG Matrix data)
 * @access  Private (Admin/Manager)
 */
async function getMenuMatrix(req, res, next) {
  try {
    const { branch_id } = req.query;

    const branchCondition = branch_id ? 'AND o.branch_id = ?' : '';
    const params = branch_id ? [branch_id] : [];

    const matrix = await query(
      `SELECT 
        p.id,
        p.name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as revenue,
        COALESCE(p.price - p.cost_price, 0) as profit_margin,
        p.rating
       FROM products p
       LEFT JOIN order_items oi ON p.id = oi.product_id
       LEFT JOIN orders o ON oi.order_id = o.id
       WHERE 1=1 ${branchCondition}
       GROUP BY p.id
       HAVING total_sold > 0
       ORDER BY revenue DESC`,
      params
    );

    return sendSuccess(res, matrix, 'Menu matrix retrieved successfully');
  } catch (error) {
    logger.error('Get menu matrix error:', error);
    next(error);
  }
}

/**
 * @route   GET /api/v1/analytics/heatmap
 * @desc    Get peak hours heatmap data
 * @access  Private (Admin/Manager)
 */
async function getHeatmapData(req, res, next) {
  try {
    const { branch_id, from_date, to_date } = req.query;

    const branchCondition = branch_id ? 'AND branch_id = ?' : '';
    const params = [from_date, to_date];
    if (branch_id) params.push(branch_id);

    const heatmap = await query(
      `SELECT 
        DAYOFWEEK(created_at) as day_of_week,
        HOUR(created_at) as hour,
        COUNT(*) as order_count,
        SUM(total) as revenue
       FROM orders
       WHERE DATE(created_at) BETWEEN ? AND ?
         AND order_status = 'completed'
         ${branchCondition}
       GROUP BY day_of_week, hour
       ORDER BY day_of_week, hour`,
      params
    );

    return sendSuccess(res, heatmap, 'Heatmap data retrieved successfully');
  } catch (error) {
    logger.error('Get heatmap data error:', error);
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getRevenueTrends,
  getMenuMatrix,
  getHeatmapData,
};

