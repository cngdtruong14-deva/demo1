const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const BranchController = require('../controllers/branchController');

// GET /:id/menu - Get menu for a specific branch
router.get('/:id/menu', (req, res) => {
  // Map :id to branchId for menuController.getMenu
  req.params.branchId = req.params.id;
  return menuController.getMenu(req, res);
});

// GET / - Get all branches
router.get('/', BranchController.getAllBranches);

module.exports = router;
