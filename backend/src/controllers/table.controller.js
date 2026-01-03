/**
 * Table Controller
 * Manages restaurant tables and QR codes
 */

const { query } = require('../config/database');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseFormatter');
const { getCache, setCache, deleteCache, CACHE_KEYS, CACHE_TTL } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * @route   GET /api/v1/tables
 * @desc    Get all tables
 * @access  Public
 */
async function getAllTables(req, res, next) {
  try {
    const { branch_id, status, page = 1, limit = 50 } = req.query;
    
    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    if (branch_id) {
      whereConditions.push('branch_id = ?');
      params.push(branch_id);
    }

    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Get total count
    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM tables ${whereClause}`,
      params
    );

    // Get tables
    const tables = await query(
      `SELECT 
        t.*,
        b.name as branch_name
       FROM tables t
       LEFT JOIN branches b ON t.branch_id = b.id
       ${whereClause}
       ORDER BY t.table_number ASC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return sendPaginated(
      res,
      tables,
      page,
      limit,
      countResult.total,
      'Tables retrieved successfully'
    );
  } catch (error) {
    logger.error('Get all tables error:', error);
    next(error);
  }
}

/**
 * @route   GET /api/v1/tables/:id
 * @desc    Get table by ID
 * @access  Public
 */
async function getTableById(req, res, next) {
  try {
    const { id } = req.params;

    // Check cache
    const cacheKey = CACHE_KEYS.TABLE(id);
    const cachedTable = await getCache(cacheKey);

    if (cachedTable) {
      return sendSuccess(res, cachedTable, 'Table retrieved from cache');
    }

    // Query database
    const tables = await query(
      `SELECT 
        t.*,
        b.name as branch_name,
        b.address as branch_address,
        b.phone as branch_phone
       FROM tables t
       LEFT JOIN branches b ON t.branch_id = b.id
       WHERE t.id = ?`,
      [id]
    );

    if (tables.length === 0) {
      return sendError(res, 'Table not found', null, 404);
    }

    // Cache the result
    await setCache(cacheKey, tables[0], CACHE_TTL.LONG);

    return sendSuccess(res, tables[0], 'Table retrieved successfully');
  } catch (error) {
    logger.error('Get table by ID error:', error);
    next(error);
  }
}

/**
 * @route   POST /api/v1/tables
 * @desc    Create a new table
 * @access  Private (Admin/Manager)
 */
async function createTable(req, res, next) {
  try {
    const {
      branch_id,
      table_number,
      capacity = 4,
      floor_number = 1,
      zone,
    } = req.body;

    // Check if table number already exists in this branch
    const existing = await query(
      'SELECT id FROM tables WHERE branch_id = ? AND table_number = ?',
      [branch_id, table_number]
    );

    if (existing.length > 0) {
      return sendError(res, 'Table number already exists in this branch', null, 400);
    }

    // Generate QR code URL
    const qr_code = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/menu?table_id={TABLE_ID}&branch_id=${branch_id}`;

    const result = await query(
      `INSERT INTO tables 
       (branch_id, table_number, capacity, qr_code, floor_number, zone, status)
       VALUES (?, ?, ?, ?, ?, ?, 'available')`,
      [branch_id, table_number, capacity, qr_code, floor_number, zone]
    );

    // Update QR code with actual table ID
    const tableId = result.insertId;
    const finalQrCode = qr_code.replace('{TABLE_ID}', tableId);
    
    await query(
      'UPDATE tables SET qr_code = ? WHERE id = ?',
      [finalQrCode, tableId]
    );

    logger.info(`Table created: ${table_number} in branch ${branch_id}`);

    return sendSuccess(
      res,
      {
        id: tableId,
        table_number,
        qr_code: finalQrCode,
      },
      'Table created successfully',
      201
    );
  } catch (error) {
    logger.error('Create table error:', error);
    next(error);
  }
}

/**
 * @route   PATCH /api/v1/tables/:id/status
 * @desc    Update table status
 * @access  Private
 */
async function updateTableStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await query(
      'UPDATE tables SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    // Invalidate cache
    await deleteCache(CACHE_KEYS.TABLE(id));

    logger.info(`Table status updated: ${id} -> ${status}`);

    return sendSuccess(res, { id, status }, 'Table status updated successfully');
  } catch (error) {
    logger.error('Update table status error:', error);
    next(error);
  }
}

/**
 * @route   DELETE /api/v1/tables/:id
 * @desc    Delete table
 * @access  Private (Admin)
 */
async function deleteTable(req, res, next) {
  try {
    const { id } = req.params;

    await query('DELETE FROM tables WHERE id = ?', [id]);

    // Invalidate cache
    await deleteCache(CACHE_KEYS.TABLE(id));

    logger.info(`Table deleted: ID ${id}`);

    return sendSuccess(res, null, 'Table deleted successfully');
  } catch (error) {
    logger.error('Delete table error:', error);
    next(error);
  }
}

module.exports = {
  getAllTables,
  getTableById,
  createTable,
  updateTableStatus,
  deleteTable,
};

