const Branch = require('../models/Branch');
const { successResponse, errorResponse } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

class BranchController {
  /**
   * GET /branches
   * Get all branches
   */
  static async getAllBranches(req, res) {
    try {
      const branches = await Branch.findAll();
      return successResponse(res, branches, 'Branches retrieved successfully');
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * GET /branches/:id
   * Get branch by ID
   */
  static async getBranchById(req, res) {
    try {
      const { id } = req.params;
      const branch = await Branch.findById(id);

      if (!branch) {
        throw new NotFoundError('Branch', id);
      }

      return successResponse(res, branch, 'Branch retrieved successfully');
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }
}

module.exports = BranchController;

