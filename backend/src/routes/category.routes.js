const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
// const { protect, authorize } = require('../middleware/auth'); // Uncomment if auth needed

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', categoryController.createCategory); // Add auth middleware later
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
