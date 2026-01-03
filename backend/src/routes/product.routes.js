/**
 * Product Routes
 * Product and menu management endpoints
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { managerOrAbove } = require('../middlewares/rbac.middleware');
const { validateBody, validateQuery } = require('../middlewares/validation.middleware');
const { createProductSchema } = require('../validators/product.validator');

/**
 * @route   GET /api/v1/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route   GET /api/v1/menu/:branchId
 * @desc    Get complete menu for branch
 * @access  Public
 */
router.get('/menu/:branchId', productController.getMenu);

/**
 * @route   POST /api/v1/products
 * @desc    Create product
 * @access  Private (Manager+)
 */
router.post(
  '/',
  authenticate,
  managerOrAbove,
  validateBody(createProductSchema),
  productController.createProduct
);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product
 * @access  Private (Manager+)
 */
router.put(
  '/:id',
  authenticate,
  managerOrAbove,
  productController.updateProduct
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product
 * @access  Private (Manager+)
 */
router.delete(
  '/:id',
  authenticate,
  managerOrAbove,
  productController.deleteProduct
);

module.exports = router;

