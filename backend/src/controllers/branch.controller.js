/**
 * Branch Controller
 * Manages restaurant branches
 */

const { query } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * @route   GET /api/v1/branches
 * @desc    Get all branches
 * @access  Public
 */
async function getAllBranches(req, res, next) {
  try {
    const { status = 'active' } = req.query;

    const branches = await query(
      'SELECT * FROM branches WHERE status = ? ORDER BY name ASC',
      [status]
    );

    return sendSuccess(res, branches, 'Branches retrieved successfully');
  } catch (error) {
    logger.error('Get all branches error:', error);
    next(error);
  }
}

/**
 * @route   GET /api/v1/branches/:id
 * @desc    Get branch by ID
 * @access  Public
 */
async function getBranchById(req, res, next) {
  try {
    const { id } = req.params;

    const branches = await query('SELECT * FROM branches WHERE id = ?', [id]);

    if (branches.length === 0) {
      return sendError(res, 'Branch not found', null, 404);
    }

    return sendSuccess(res, branches[0], 'Branch retrieved successfully');
  } catch (error) {
    logger.error('Get branch error:', error);
    next(error);
  }
}

/**
 * @route   POST /api/v1/branches
 * @desc    Create new branch
 * @access  Private (Admin)
 */
async function createBranch(req, res, next) {
  try {
    const {
      name,
      address,
      phone,
      email,
      latitude,
      longitude,
      opening_time = '08:00:00',
      closing_time = '22:00:00',
    } = req.body;

    const result = await query(
      `INSERT INTO branches 
       (name, address, phone, email, latitude, longitude, opening_time, closing_time, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [name, address, phone, email, latitude, longitude, opening_time, closing_time]
    );

    logger.info(`Branch created: ${name}`);

    return sendSuccess(
      res,
      { id: result.insertId, name },
      'Branch created successfully',
      201
    );
  } catch (error) {
    logger.error('Create branch error:', error);
    next(error);
  }
}

/**
 * @route   PUT /api/v1/branches/:id
 * @desc    Update branch
 * @access  Private (Admin)
 */
async function updateBranch(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const fields = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.values(updateData);

    await query(
      `UPDATE branches SET ${fields}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    logger.info(`Branch updated: ID ${id}`);

    return sendSuccess(res, { id }, 'Branch updated successfully');
  } catch (error) {
    logger.error('Update branch error:', error);
    next(error);
  }
}

module.exports = {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
};

