const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');

// POST / - Create or get customer
router.post('/', CustomerController.createOrGetCustomer);

// GET /:id - Get customer details
router.get('/:id', CustomerController.getCustomer);

module.exports = router;

