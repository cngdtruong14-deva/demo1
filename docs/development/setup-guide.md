```markdown
# Development Setup Guide

## Yêu cầu hệ thống

### Software Requirements
- **Node.js**: >= 18.x LTS
- **MySQL**: >= 8.0
- **Redis**: >= 7.0
- **Docker**: >= 24.0 (Optional but recommended)
- **Git**: >= 2.30

### Hardware Requirements
- **RAM**: Minimum 8GB, Recommended 16GB
- **Disk**: Minimum 20GB free space
- **CPU**: 4 cores recommended

---

## Bước 1: Clone Repository

```bash
# Clone project
git clone https://github.com/your-org/qr-order-platform.git
cd qr-order-platform

# Checkout development branch
git checkout develop
## Bước 2: Setup Backend

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment Variables

```bash
# Copy file mẫu
cp .env.example .env

# Chỉnh sửa .env
nano .env
```

**File .env cần thiết:**
```env
# Application
NODE_ENV=development
PORT=5000
APP_NAME=QR Order Platform

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=qr_order_db
DB_USER=root
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=24h

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 2.3 Setup Database

```bash
# Khởi tạo database
mysql -u root -p < ../database/init.sql

# Import dữ liệu mẫu
mysql -u root -p qr_order_db < ../database/seed.sql

# Hoặc dùng script
npm run migrate
npm run seed
```

### 2.4 Start Backend Server

```bash
# Development mode với auto-reload
npm run dev

# Production mode
npm start

# Kiểm tra server đang chạy
curl http://localhost:5000/api/v1/health
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-15T10:00:00Z"
}
```

---

## Bước 3: Setup Frontend Customer

### 3.1 Install Dependencies

```bash
cd ../frontend-customer
npm install
```

### 3.2 Configure Environment

```bash
cp .env.local.example .env.local
nano .env.local
```

**File .env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=QR Order
NEXT_PUBLIC_STORAGE_KEY=qr_order_cart
```

### 3.3 Start Development Server

```bash
npm run dev

# Server chạy tại http://localhost:3000
```

---

## Bước 4: Setup Frontend Admin

### 4.1 Install Dependencies

```bash
cd ../frontend-admin
npm install
```

### 4.2 Configure Environment

```bash
cp .env.example .env
nano .env
```

**File .env:**
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=QR Order Admin
```

### 4.3 Start Development Server

```bash
npm run dev

# Server chạy tại http://localhost:3001
```

---

## Bước 5: Setup với Docker (Recommended)

### 5.1 Start All Services

```bash
# Từ thư mục root
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 5.2 Access Services

- **Backend API**: http://localhost:5000
- **Frontend Customer**: http://localhost:3000
- **Frontend Admin**: http://localhost:3001
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

---

## Bước 6: Verify Installation

### 6.1 Test Backend API

```bash
# Health check
curl http://localhost:5000/api/v1/health

# Test products endpoint
curl http://localhost:5000/api/v1/products
```

### 6.2 Test Socket Connection

```bash
# Install wscat
npm install -g wscat

# Connect to socket
wscat -c ws://localhost:5000
```

### 6.3 Test Frontend

1. Mở browser: http://localhost:3000
2. Scan QR code hoặc nhập URL: http://localhost:3000/qr/table-uuid
3. Kiểm tra menu hiển thị
4. Thêm món vào giỏ hàng
5. Tạo đơn hàng

---

## Bước 7: Development Workflow

### 7.1 Git Branching Strategy

```
main (production)
  └── develop (development)
       ├── feature/add-payment-gateway
       ├── feature/ai-recommendation
       ├── bugfix/order-status-sync
       └── hotfix/critical-bug
```

### 7.2 Create Feature Branch

```bash
# Từ develop branch
git checkout develop
git pull origin develop

# Tạo feature branch
git checkout -b feature/your-feature-name

# Sau khi code xong
git add .
git commit -m "feat: add feature description"
git push origin feature/your-feature-name

# Tạo Pull Request trên GitHub
```

### 7.3 Commit Message Convention

```
feat: Thêm tính năng mới
fix: Sửa bug
docs: Cập nhật documentation
style: Format code (không ảnh hưởng logic)
refactor: Refactor code
test: Thêm/sửa tests
chore: Cập nhật build tools, dependencies
```

---

## Bước 8: Testing

### 8.1 Unit Tests

```bash
cd backend
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### 8.2 Integration Tests

```bash
npm run test:integration
```

### 8.3 E2E Tests

```bash
cd ../testing/e2e
npx playwright install
npx playwright test

# Với UI mode
npx playwright test --ui
```

---

## Bước 9: Debugging

### 9.1 Backend Debugging (VS Code)

**File .vscode/launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["/**"],
      "program": "${workspaceFolder}/backend/server.js",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### 9.2 Frontend Debugging

**Chrome DevTools:**
1. Mở Developer Tools (F12)
2. Tab "Sources" → Breakpoints
3. Tab "Network" → XHR requests
4. Tab "Console" → Logs

**React DevTools:**
```bash
# Install extension
# Chrome: React Developer Tools
# Firefox: React Developer Tools
```

---

## Bước 10: Common Issues & Solutions

### Issue 1: Cannot connect to MySQL

**Error:**
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user
```

**Solution:**
```bash
# Reset MySQL password
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### Issue 2: Port already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 

# Or use different port
PORT=5001 npm run dev
```

### Issue 3: Redis connection failed

**Solution:**
```bash
# Start Redis server
redis-server

# Or with Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### Issue 4: CORS errors

**Error:**
```
Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS
```

**Solution:**
```javascript
// backend/src/config/app.js
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
```

---

## Bước 11: Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-azuretools.vscode-docker"
  ]
}
```

### Useful CLI Tools

```bash
# API Testing
npm install -g httpie

# Database GUI
# Download: MySQL Workbench, DBeaver

# Redis GUI
# Download: RedisInsight

# Performance Monitoring
npm install -g clinic
```

---

## Next Steps

1. ✅ Đọc [Coding Standards](./coding-standards.md)
2. ✅ Xem [API Documentation](../architecture/api-design.md)
3. ✅ Tham gia [Team Communication](../team/communication.md)
4. ✅ Review [Project Roadmap](../../README.md#roadmap)
```

---

## 📂 docs/development/coding-standards.md

```markdown
# Coding Standards & Best Practices

## JavaScript/Node.js Standards

### 1. Naming Conventions

```javascript
// ✅ GOOD: camelCase cho biến và hàm
const userName = 'John Doe';
function calculateTotal() {}

// ✅ GOOD: PascalCase cho class và component
class ProductController {}
const UserProfile = () => {};

// ✅ GOOD: UPPER_SNAKE_CASE cho constants
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// ❌ BAD: Inconsistent naming
const user_name = 'John';
function Calculate_total() {}
```

### 2. File Naming

```
✅ GOOD:
- productController.js
- userService.js
- orderModel.js
- TableLayout.jsx (React component)

❌ BAD:
- Product-Controller.js
- user_service.js
- Order.model.js
```

### 3. Code Structure

```javascript
// ✅ GOOD: Clear and organized
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const ProductController = require('../controllers/product.controller');

// Routes
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', authenticate, ProductController.create);

module.exports = router;

// ❌ BAD: Messy and unclear
const express=require('express');
const router=express.Router();
router.get('/',function(req,res){
  // Business logic directly in routes
});
```

### 4. Error Handling

```javascript
// ✅ GOOD: Try-catch with proper error handling
async function getProductById(id) {
  try {
    const product = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }
    
    return product;
  } catch (error) {
    logger.error('Error in getProductById:', error);
    throw error;
  }
}

// ❌ BAD: No error handling
async function getProductById(id) {
  const product = await db.query('SELECT * FROM products WHERE id = ?', [id]);
  return product;
}
```

### 5. Async/Await Best Practices

```javascript
// ✅ GOOD: Proper async/await usage
async function processOrder(orderId) {
  try {
    const order = await getOrder(orderId);
    const payment = await processPayment(order);
    await updateOrderStatus(orderId, 'paid');
    await sendNotification(order.customerId);
    
    return { success: true, payment };
  } catch (error) {
    logger.error('Order processing failed:', error);
    throw error;
  }
}

// ❌ BAD: Mixing promises and callbacks
function processOrder(orderId, callback) {
  getOrder(orderId).then(order => {
    processPayment(order, (err, payment) => {
      if (err) return callback(err);
      callback(null, payment);
    });
  });
}
```

---

## React/Next.js Standards

### 1. Component Structure

```jsx
// ✅ GOOD: Functional component with hooks
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  
  useEffect(() => {
    // Side effects here
  }, [product]);
  
  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity });
  };
  
  return (
    
      
      {product.name}
      {product.price.toLocaleString('vi-VN')} đ
      Thêm vào giỏ
    
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    imageUrl: PropTypes.string
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired
};

export default ProductCard;

// ❌ BAD: Class component without proper structure
class ProductCard extends React.Component {
  render() {
    return {this.props.product.name};
  }
}
```

### 2. Custom Hooks

```javascript
// ✅ GOOD: Reusable custom hook
import { useState, useEffect } from 'react';

export const useSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    const newSocket = io(url);
    
    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));
    
    setSocket(newSocket);
    
    return () => newSocket.close();
  }, [url]);
  
  return { socket, connected };
};

// Usage
const { socket, connected } = useSocket('http://localhost:5000');
```

### 3. State Management

```javascript
// ✅ GOOD: Zustand store
import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  
  addItem: (product) => set((state) => ({
    items: [...state.items, product]
  })),
  
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item.id !== productId)
  })),
  
  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
  
  clearCart: () => set({ items: [] })
}));
```

---

## SQL Standards

### 1. Query Writing

```sql
-- ✅ GOOD: Clear and formatted
SELECT 
  p.id,
  p.name,
  p.price,
  c.name AS category_name,
  COUNT(oi.id) AS sold_count
FROM products p
INNER JOIN categories c ON p.category_id = c.id
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE p.status = 'available'
  AND p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY p.id
ORDER BY sold_count DESC
LIMIT 10;

-- ❌ BAD: Unreadable
SELECT p.id,p.name,p.price FROM products p WHERE p.status='available' ORDER BY p.name;
```

### 2. Parameterized Queries

```javascript
// ✅ GOOD: Prevents SQL injection
const getProductById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM products WHERE id = ?',
    [id]
  );
  return rows[0];
};

// ❌ BAD: SQL injection vulnerability
const getProductById = async (id) => {
  const query = `SELECT * FROM products WHERE id = '${id}'`;
  const [rows] = await db.query(query);
  return rows[0];
};
```

---

## API Response Standards

### Success Response Format

```javascript
// ✅ GOOD: Consistent format
res.status(200).json({
  success: true,
  data: {
    products: [...],
    pagination: {
      page: 1,
      limit: 20,
      total: 156
    }
  },
  message: 'Products retrieved successfully',
  timestamp: new Date().toISOString()
});
```

### Error Response Format

```javascript
// ✅ GOOD: Detailed error info
res.status(404).json({
  success: false,
  error: {
    code: 'PRODUCT_NOT_FOUND',
    message: 'Product with ID xyz not found',
    details: {
      productId: 'xyz',
      timestamp: new Date().toISOString()
    }
  }
});
```

---

## Security Best Practices

### 1. Input Validation

```javascript
// ✅ GOOD: Joi validation
const Joi = require('joi');

const orderSchema = Joi.object({
  tableId: Joi.string().uuid().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().uuid().required(),
      quantity: Joi.number().integer().min(1).max(99).required()
    })
  ).min(1).required()
});

const validateOrder = (data) => {
  return orderSchema.validate(data);
};
```

### 2. Password Hashing

```javascript
// ✅ GOOD: Use bcrypt
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
```

### 3. JWT Best Practices

```javascript
// ✅ GOOD: Secure JWT implementation
const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
```

---

## Testing Standards

### 1. Unit Test Example

```javascript
// ✅ GOOD: Clear test structure
describe('ProductController', () => {
  describe('getAll', () => {
    it('should return list of products', async () => {
      // Arrange
      const mockProducts = [{ id: '1', name: 'Test Product' }];
      jest.spyOn(ProductModel, 'findAll').mockResolvedValue(mockProducts);
      
      // Act
      const result = await ProductController.getAll();
      
      // Assert
      expect(result).toEqual(mockProducts);
      expect(ProductModel.findAll).toHaveBeenCalledTimes(1);
    });
    
    it('should handle errors gracefully', async () => {
      // Arrange
      jest.spyOn(ProductModel, 'findAll').mockRejectedValue(new Error('DB Error'));
      
      // Act & Assert
      await expect(ProductController.getAll()).rejects.toThrow('DB Error');
    });
  });
});
```

---

## Documentation Standards

### 1. Function Documentation

```javascript
/**
 * Tạo đơn hàng mới
 * 
 * @param {Object} orderData - Dữ liệu đơn hàng
 * @param {string} orderData.tableId - ID của bàn
 * @param {Array} orderData.items - Danh sách món
 * @param {string} orderData.customerId - ID khách hàng (optional)
 * @returns {Promise} Thông tin đơn hàng đã tạo
 * @throws {Error} Nếu dữ liệu không hợp lệ
 * 
 * @example
 * const order = await createOrder({
 *   tableId: 'table-123',
 *   items: [{ productId: 'prod-1', quantity: 2 }]
 * });
 */
async function createOrder(orderData) {
  // Implementation
}
```

---

## Performance Best Practices

### 1. Database Indexing

```sql
-- ✅ GOOD: Index for frequently queried columns
CREATE INDEX idx_products_category_status ON products(category_id, status);
CREATE INDEX idx_orders_table_date ON orders(table_id, created_at DESC);
CREATE INDEX idx_customers_phone ON customers(phone);
```

### 2. Caching Strategy

```javascript
// ✅ GOOD: Redis caching
const redis = require('../config/redis');

const getProductsWithCache = async () => {
  const cacheKey = 'products:all';
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const products = await ProductModel.findAll();
  
  // Store in cache (1 hour)
  await redis.setex(cacheKey, 3600, JSON.stringify(products));
  
  return products;
};
```

---

## Git Commit Standards

```bash
# ✅ GOOD: Clear commit messages
git commit -m "feat(products): add search functionality with filters"
git commit -m "fix(orders): resolve race condition in order status update"
git commit -m "docs(api): update authentication endpoint documentation"
git commit -m "refactor(database): optimize product query performance"

# ❌ BAD: Unclear messages
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

---

## Code Review Checklist

- [ ] Code follows naming conventions
- [ ] No hardcoded values (use environment variables)
- [ ] Proper error handling implemented
- [ ] Input validation added
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No console.log() in production code
- [ ] Security vulnerabilities checked
- [ ] Performance optimized
- [ ] Database queries use parameterized statements
```

---
