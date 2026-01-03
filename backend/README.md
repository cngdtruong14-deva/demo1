# Smart Restaurant Backend API

Production-ready Node.js backend for Smart QR Ordering Platform.

## 🚀 Features

- **RESTful API** with Express.js
- **Real-time Communication** with Socket.io
- **Authentication** with JWT
- **Database** MySQL with connection pooling
- **Caching** with Redis
- **Scheduled Jobs** for dynamic pricing and reports
- **Input Validation** with Joi
- **Security** with Helmet, CORS, rate limiting
- **Logging** with Winston
- **Docker** support

## 📦 Installation

```bash
cd backend
npm install
```

## 🔧 Configuration

Copy `.env` and configure:

```bash
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_NAME=restaurant_db
DB_USER=root
DB_PASSWORD=
REDIS_HOST=localhost
JWT_SECRET=your-secret-key
```

## 🏃 Running

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

Docker:
```bash
docker build -t restaurant-backend .
docker run -p 5000:5000 restaurant-backend
```

## 📚 API Documentation

Base URL: `http://localhost:5000/api/v1`

### Auth
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Get current user

### Products
- `GET /products` - List products
- `GET /products/:id` - Get product
- `GET /menu/:branchId` - Get menu
- `POST /products` - Create product (Admin)
- `PUT /products/:id` - Update product (Admin)

### Orders
- `POST /orders` - Create order
- `GET /orders` - List orders
- `GET /orders/:id` - Get order
- `PATCH /orders/:id/status` - Update order status
- `GET /orders/kitchen/:branchId` - Kitchen display

### Analytics
- `GET /analytics/dashboard` - Dashboard stats
- `GET /analytics/revenue` - Revenue trends
- `GET /analytics/menu-matrix` - BCG Matrix
- `GET /analytics/heatmap` - Peak hours

## 🔌 Socket.io Events

### Client → Server
- `join_table` - Join table room
- `join_kitchen` - Join kitchen room
- `join_branch` - Join branch room
- `place_order` - Place order

### Server → Client
- `new_order` - New order alert
- `order_update` - Order status change
- `item_status_change` - Item status change
- `notification` - General notification

## 📝 Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration
│   ├── controllers/    # Route controllers
│   ├── middlewares/    # Express middlewares
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── sockets/        # Socket.io handlers
│   ├── jobs/           # Scheduled jobs
│   ├── utils/          # Utilities
│   └── validators/     # Input validation
├── tests/              # Test suites
├── server.js           # Entry point
└── package.json
```

## 🛡️ Security

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet security headers
- Input validation
- SQL injection prevention

## 📈 Performance

- Redis caching
- Database connection pooling
- Compression middleware
- Query optimization

## 🔄 Scheduled Jobs

- **Dynamic Pricing** - Hourly price adjustments
- **Inventory Alerts** - Daily stock level checks
- **Report Generation** - Daily sales reports

## 🧪 Testing

```bash
npm test
npm run test:unit
npm run test:integration
```

## 📄 License

MIT

