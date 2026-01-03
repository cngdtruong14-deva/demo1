/**
 * Customer Controller
 * Customer management and profiles
 */

const { query } = require('../config/database');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * @route   GET /api/v1/customers
 * @desc    Get all customers
 * @access  Private (Admin/Manager)
 */
async function getAllCustomers(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      segment_id,
      status = 'active',
      search,
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['status = ?'];
    let params = [status];

    if (segment_id) {
      whereConditions.push('segment_id = ?');
      params.push(segment_id);
    }

    if (search) {
      whereConditions.push('(name LIKE ? OR phone LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    // Get total count
    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM customers ${whereClause}`,
      params
    );

    // Get customers
    const customers = await query(
      `SELECT 
        c.*,
        s.name as segment_name
       FROM customers c
       LEFT JOIN segments s ON c.segment_id = s.id
       ${whereClause}
       ORDER BY c.total_spent DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return sendPaginated(
      res,
      customers,
      page,
      limit,
      countResult.total,
      'Customers retrieved successfully'
    );
  } catch (error) {
    logger.error('Get all customers error:', error);
    next(error);
  }
}

/**
 * @route   GET /api/v1/customers/:id
 * @desc    Get customer by ID
 * @access  Private
 */
async function getCustomerById(req, res, next) {
  try {
    const { id } = req.params;

    const customers = await query(
      `SELECT 
        c.*,
        s.name as segment_name,
        lp.points as loyalty_points,
        lp.tier as loyalty_tier
       FROM customers c
       LEFT JOIN segments s ON c.segment_id = s.id
       LEFT JOIN loyalty_points lp ON c.id = lp.customer_id
       WHERE c.id = ?`,
      [id]
    );

    if (customers.length === 0) {
      return sendError(res, 'Customer not found', null, 404);
    }

    // Get order history
    const orders = await query(
      `SELECT id, order_number, total, order_status, created_at
       FROM orders
       WHERE customer_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [id]
    );

    return sendSuccess(
      res,
      { ...customers[0], recent_orders: orders },
      'Customer retrieved successfully'
    );
  } catch (error) {
    logger.error('Get customer error:', error);
    next(error);
  }
}

/**
 * @route   POST /api/v1/customers
 * @desc    Create customer
 * @access  Public
 */
async function createCustomer(req, res, next) {
  try {
    const { phone, name, email, gender, date_of_birth } = req.body;

    // Check if phone exists
    const existing = await query(
      'SELECT id FROM customers WHERE phone = ?',
      [phone]
    );

    if (existing.length > 0) {
      return sendError(res, 'Phone number already registered', null, 400);
    }

    const result = await query(
      `INSERT INTO customers 
       (phone, name, email, gender, date_of_birth, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [phone, name, email, gender, date_of_birth]
    );

    logger.info(`Customer created: ${phone}`);

    return sendSuccess(
      res,
      { id: result.insertId, phone, name },
      'Customer created successfully',
      201
    );
  } catch (error) {
    logger.error('Create customer error:', error);
    next(error);
  }
}

/**
 * @route   PUT /api/v1/customers/:id
 * @desc    Update customer
 * @access  Private
 */
async function updateCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const fields = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.values(updateData);

    await query(
      `UPDATE customers SET ${fields}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    logger.info(`Customer updated: ID ${id}`);

    return sendSuccess(res, { id }, 'Customer updated successfully');
  } catch (error) {
    logger.error('Update customer error:', error);
    next(error);
  }
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
};

