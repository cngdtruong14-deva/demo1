/**
 * Report Generation Job
 * Generate daily sales and performance reports
 */

const { query, getConnection } = require('../config/database');
const logger = require('../utils/logger');

async function reportGenerationJob() {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    logger.info('📊 Generating daily reports...');

    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const reportDate = yesterday.toISOString().split('T')[0];

    // Get all branches
    const branches = await connection.query('SELECT id FROM branches WHERE status = "active"');

    for (const branch of branches[0]) {
      // Calculate daily statistics
      const [stats] = await connection.query(
        `SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN order_status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
          SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
          COALESCE(SUM(CASE WHEN order_status = 'completed' THEN total ELSE 0 END), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN order_status = 'completed' THEN discount ELSE 0 END), 0) as total_discount,
          COALESCE(AVG(CASE WHEN order_status = 'completed' THEN total ELSE NULL END), 0) as avg_order_value,
          COUNT(DISTINCT customer_id) as total_customers
         FROM orders
         WHERE branch_id = ?
           AND DATE(created_at) = ?`,
        [branch.id, reportDate]
      );

      const report = stats[0];
      report.net_revenue = report.total_revenue - report.total_discount;

      // Get top products
      const [topProducts] = await connection.query(
        `SELECT 
          p.name,
          SUM(oi.quantity) as quantity_sold,
          SUM(oi.subtotal) as revenue
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         JOIN orders o ON oi.order_id = o.id
         WHERE o.branch_id = ?
           AND DATE(o.created_at) = ?
           AND o.order_status = 'completed'
         GROUP BY p.id
         ORDER BY quantity_sold DESC
         LIMIT 5`,
        [branch.id, reportDate]
      );

      // Get peak hours
      const [peakHours] = await connection.query(
        `SELECT 
          HOUR(created_at) as hour,
          COUNT(*) as order_count
         FROM orders
         WHERE branch_id = ?
           AND DATE(created_at) = ?
         GROUP BY hour
         ORDER BY order_count DESC
         LIMIT 3`,
        [branch.id, reportDate]
      );

      // Insert or update report
      await connection.query(
        `INSERT INTO sales_reports 
         (branch_id, report_date, report_type, total_orders, completed_orders, 
          cancelled_orders, total_revenue, total_discount, net_revenue, 
          total_customers, avg_order_value, top_products, peak_hours)
         VALUES (?, ?, 'daily', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         total_orders = VALUES(total_orders),
         completed_orders = VALUES(completed_orders),
         cancelled_orders = VALUES(cancelled_orders),
         total_revenue = VALUES(total_revenue),
         total_discount = VALUES(total_discount),
         net_revenue = VALUES(net_revenue),
         total_customers = VALUES(total_customers),
         avg_order_value = VALUES(avg_order_value),
         top_products = VALUES(top_products),
         peak_hours = VALUES(peak_hours)`,
        [
          branch.id,
          reportDate,
          report.total_orders,
          report.completed_orders,
          report.cancelled_orders,
          report.total_revenue,
          report.total_discount,
          report.net_revenue,
          report.total_customers,
          report.avg_order_value,
          JSON.stringify(topProducts),
          JSON.stringify(peakHours),
        ]
      );

      logger.info(
        `Generated report for branch ${branch.id}: ` +
        `${report.completed_orders} orders, ${report.total_revenue} VND revenue`
      );
    }

    await connection.commit();
    logger.info(`✅ Report generation job completed`);
  } catch (error) {
    await connection.rollback();
    logger.error('❌ Report generation job failed:', error);
  } finally {
    connection.release();
  }
}

module.exports = reportGenerationJob;

