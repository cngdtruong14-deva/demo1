const express = require('express');
const router = express.Router();
const TableController = require('../controllers/tableController');

// GET / - Get all tables (with filters)
router.get('/', TableController.getTables);

// GET /:id - Get table details (validates table exists)
router.get('/:id', TableController.getTableDetails);

module.exports = router;
