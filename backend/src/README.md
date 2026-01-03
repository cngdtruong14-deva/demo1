# Backend Source Code Structure

## 📁 Directory Structure

```
src/
├── config/          # Configuration files
│   ├── database.js  # MySQL connection pool
│   ├── redis.js     # Redis client
│   ├── jwt.js       # JWT configuration
│   ├── logger.js    # Winston logger
│   └── index.js     # Main config
│
├── models/          # Database models (Data Access Layer)
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Order.js
│   ├── OrderItem.js
│   ├── Customer.js
│   ├── Table.js
│   ├── Branch.js
│   └── ...
│
├── controllers/     # Route controllers (Presentation Layer)
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   └── ...
│
├── services/        # Business logic (Business Logic Layer)
│   ├── authService.js
│   ├── productService.js
│   ├── orderService.js
│   ├── paymentService.js
│   └── ...
│
├── routes/          # API routes
│   ├── index.js
│   ├── authRoutes.js
│   ├── productRoutes.js
│   └── ...
│
├── middlewares/     # Express middlewares
│   ├── auth.js      # Authentication & Authorization
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── validator.js
│
├── validators/      # Request validation rules
│   ├── authValidator.js
│   ├── productValidator.js
│   └── ...
│
├── utils/           # Utility functions
│   ├── response.js  # API response helpers
│   ├── errors.js    # Custom error classes
│   └── helpers.js   # Helper functions
│
├── sockets/         # Socket.io handlers
│   ├── index.js
│   └── handlers/
│       ├── orderHandlers.js
│       ├── tableHandlers.js
│       ├── kitchenHandlers.js
│       └── notificationHandlers.js
│
├── jobs/            # Background jobs
│   └── index.js
│
├── app.js           # Express app setup
└── README.md        # This file
```

## 🏗️ Architecture

### Layered Architecture

1. **Presentation Layer** (`controllers/`)
   - Handle HTTP requests/responses
   - Request validation
   - Response formatting

2. **Business Logic Layer** (`services/`)
   - Core business logic
   - Data transformation
   - Business rules

3. **Data Access Layer** (`models/`)
   - Database queries
   - Data persistence
   - Data retrieval

4. **Middleware Layer** (`middlewares/`)
   - Authentication
   - Authorization
   - Error handling
   - Rate limiting

## 📝 Module Implementation Guide

### Creating a New Module

1. **Create Model** (`models/YourModel.js`)
```javascript
const db = require('../config/database');

class YourModel {
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM your_table WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }
  
  static async create(data) {
    // Implementation
  }
}

module.exports = YourModel;
```

2. **Create Service** (`services/yourService.js`)
```javascript
const YourModel = require('../models/YourModel');

class YourService {
  static async getById(id) {
    return await YourModel.findById(id);
  }
}

module.exports = YourService;
```

3. **Create Controller** (`controllers/yourController.js`)
```javascript
const YourService = require('../services/yourService');
const { successResponse, errorResponse } = require('../utils/response');

class YourController {
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await YourService.getById(id);
      return successResponse(res, data);
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }
}

module.exports = YourController;
```

4. **Create Validator** (`validators/yourValidator.js`)
```javascript
const { body, param } = require('express-validator');

const getByIdValidator = [
  param('id').isUUID().withMessage('Invalid ID format')
];

module.exports = { getByIdValidator };
```

5. **Create Routes** (`routes/yourRoutes.js`)
```javascript
const express = require('express');
const router = express.Router();
const YourController = require('../controllers/yourController');
const { getByIdValidator } = require('../validators/yourValidator');
const { validate, authenticate } = require('../middlewares');

router.get('/:id', authenticate, getByIdValidator, validate, YourController.getById);

module.exports = router;
```

6. **Register Routes** (`routes/index.js`)
```javascript
const yourRoutes = require('./yourRoutes');
router.use('/your-resource', yourRoutes);
```

## 🔐 Authentication & Authorization

### Using Authentication Middleware

```javascript
const { authenticate, authorize } = require('../middlewares');

// Require authentication
router.get('/protected', authenticate, controller.method);

// Require specific role
router.get('/admin-only', authenticate, authorize('admin', 'manager'), controller.method);
```

### User Object in Request

After authentication, `req.user` contains:
```javascript
{
  userId: 'uuid',
  email: 'user@example.com',
  role: 'admin' | 'staff' | 'customer',
  branchId: 'branch-uuid'
}
```

## 📤 API Response Format

### Success Response
```javascript
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Error Response
```javascript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Paginated Response
```javascript
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "message": "Data retrieved successfully",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## 🚨 Error Handling

### Custom Errors

```javascript
const { NotFoundError, ValidationError } = require('../utils/errors');

// Throw custom error
throw new NotFoundError('Product', productId);
throw new ValidationError('Invalid input', { field: 'email' });
```

### Error Handler

All errors are automatically caught by `errorHandler` middleware in `app.js`.

## 🔌 Socket.io Usage

### Emitting Events

```javascript
const { emitOrderStatusUpdate } = require('../sockets/handlers/orderHandlers');

// In your service/controller
emitOrderStatusUpdate(io, orderId, orderData);
```

### Room Names

- Order room: `order:{orderId}`
- Table room: `table:{tableId}`
- Customer room: `customer:{customerId}`
- Admin room: `admin:{branchId}`
- Kitchen room: `kitchen`

## 📋 TODO: Modules to Implement

Based on API design documentation, the following modules need to be implemented:

- [x] Auth (Login, Refresh, Logout)
- [ ] Products (CRUD, Search, Filter)
- [ ] Categories (CRUD)
- [ ] Tables (CRUD, QR Generation, Status)
- [ ] Orders (Create, Update Status, Payment)
- [ ] Order Items (Status Updates)
- [ ] Customers (CRUD, Segments, Stats)
- [ ] Analytics (Dashboard, Reports, Heatmap)
- [ ] Segments (CRUD, Auto-assignment)
- [ ] Recommendations (AI-powered)
- [ ] Notifications (Zalo ZNS, Email)
- [ ] Branches (CRUD)
- [ ] Staff/Users (CRUD)
- [ ] Promotions (CRUD, Apply)
- [ ] Reviews (CRUD, Ratings)
- [ ] Payments (VNPay, MoMo integration)
- [ ] Loyalty Points (Earn, Redeem)
- [ ] Inventory (Track, Alerts)

## 🧪 Testing

### Unit Tests
Place in `tests/unit/`

### Integration Tests
Place in `tests/integration/`

### E2E Tests
Place in `tests/e2e/`

## 📚 References

- [API Design](./docs/architecture/api-design.md)
- [Database Schema](./docs/architecture/database-schema.md)
- [System Design](./docs/architecture/system-design.md)
- [Real-time Flow](./docs/architecture/realtime-flow.md)

