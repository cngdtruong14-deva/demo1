const MenuService = require('../services/menuService');
const { successResponse, errorResponse } = require('../utils/response');

class MenuController {
  /**
   * GET /menu/:branchId
   * Get full menu with nested categories and products
   */
  static async getMenu(req, res) {
    try {
      const { branchId } = req.params;
      const { status, search, hideEmpty } = req.query;

      const filters = {
        status: status || 'available',
        search: search || null,
        hideEmpty: hideEmpty === 'true'
      };

      const menu = await MenuService.getMenuByBranch(branchId, filters);
      return successResponse(res, menu, 'Menu retrieved successfully');
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * GET /menu/:branchId/summary
   * Get menu summary (categories only)
   */
  static async getMenuSummary(req, res) {
    try {
      const { branchId } = req.params;
      const summary = await MenuService.getMenuSummary(branchId);
      return successResponse(res, summary, 'Menu summary retrieved successfully');
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }
}

module.exports = MenuController;

