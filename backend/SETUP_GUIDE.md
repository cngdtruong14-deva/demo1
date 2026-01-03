# 🚀 Smart Restaurant Backend - Setup Guide

Complete step-by-step guide to set up and deploy the backend.

## 📋 Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ installed and running
- Redis installed and running
- Git installed

## 🔧 Step 1: Environment Setup

### Option A: Interactive Setup (Recommended)
```bash
cd backend
npm run setup
```
This will guide you through creating `.env` file with all required configurations.

### Option B: Manual Setup
1. Copy `.env.example` to `.env` (if exists)
2. Update the following values:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `REDIS_HOST`, `REDIS_PORT`
   - `JWT_SECRET` (generate a strong random string)
   - `FRONTEND_URL` (your frontend URL)

## 🗄️ Step 2: Database Setup

### 2.1 Create Database
```bash
mysql -u root -p
CREATE DATABASE restaurant_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2.2 Run Migrations
```bash
npm run migrate
```
This will create all tables, indexes, stored procedures, and views.

### 2.3 Seed Sample Data
```bash
npm run seed
```
This will populate the database with sample data for testing.

## 🧪 Step 3: Test API Endpoints

### 3.1 Start the Server
```bash
npm run dev
```

### 3.2 Test Health Endpoint
```bash
curl http://localhost:5000/health
```

### 3.3 Import Postman Collection
1. Open Postman or Thunder Client
2. Import `backend/tests/api/postman-collection.json`
3. Test endpoints:
   - Health Check
   - Register/Login
   - Create Order
   - Get Products

### 3.4 Test with cURL

**Register User:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restaurant.com",
    "password": "password123",
    "name": "Admin User",
    "role": "admin"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restaurant.com",
    "password": "password123"
  }'
```

**Get Menu:**
```bash
curl http://localhost:5000/api/v1/menu/branch-001
```

## 🔗 Step 4: Connect Frontend Applications

### 4.1 Update Frontend-Customer API URL

Edit `frontend-customer/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 4.2 Update Frontend-Admin API URL

Edit `frontend-admin/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

### 4.3 Test Frontend Connection
1. Start backend: `npm run dev`
2. Start frontend-customer: `cd ../frontend-customer && npm run dev`
3. Start frontend-admin: `cd ../frontend-admin && npm run dev`
4. Verify API calls work from frontend

## 💳 Step 5: Payment Gateway Setup

### 5.1 VNPay Configuration

1. Register at [VNPay](https://sandbox.vnpayment.vn/)
2. Get credentials:
   - Terminal Code (TMN Code)
   - Secret Key
3. Update `.env`:
```env
VNPAY_TMN_CODE=your_tmn_code
VNPAY_SECRET_KEY=your_secret_key
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/callback
```

### 5.2 Momo Configuration

1. Register at [Momo Developer Portal](https://developers.momo.vn/)
2. Get credentials:
   - Partner Code
   - Access Key
   - Secret Key
3. Update `.env`:
```env
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:3000/payment/callback
```

### 5.3 Test Payment Flow

1. Create an order via API
2. Call payment service to get payment URL
3. Redirect user to payment URL
4. Handle callback and verify payment

## 🧪 Step 6: Unit Tests

### 6.1 Run Tests
```bash
npm test
```

### 6.2 Run Specific Test Suites
```bash
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
```

### 6.3 Test Coverage
```bash
npm test -- --coverage
```

## 🚀 Step 7: Deployment

### Option A: PM2 Deployment (Recommended)

1. **Build and Deploy:**
```bash
npm run deploy production
```

2. **Manual PM2 Setup:**
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

3. **PM2 Commands:**
```bash
pm2 logs restaurant-backend    # View logs
pm2 monit                      # Monitor
pm2 restart restaurant-backend # Restart
pm2 stop restaurant-backend    # Stop
```

### Option B: Docker Deployment

1. **Build Docker Image:**
```bash
docker build -t restaurant-backend .
```

2. **Run Container:**
```bash
docker run -d \
  --name restaurant-backend \
  -p 5000:5000 \
  --env-file .env \
  restaurant-backend
```

3. **Docker Compose (if available):**
```bash
docker-compose up -d
```

## 📊 Monitoring & Maintenance

### View Logs
```bash
# PM2 logs
pm2 logs restaurant-backend

# File logs
tail -f logs/combined.log
tail -f logs/error.log
```

### Health Check
```bash
curl http://localhost:5000/health
```

### Database Backup
```bash
mysqldump -u root -p restaurant_db > backup_$(date +%Y%m%d).sql
```

## 🔍 Troubleshooting

### Database Connection Issues
- Check MySQL is running: `mysql -u root -p`
- Verify credentials in `.env`
- Check firewall/port 3306

### Redis Connection Issues
- Check Redis is running: `redis-cli ping`
- Verify credentials in `.env`
- Check firewall/port 6379

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process: `lsof -ti:5000 | xargs kill`

### JWT Errors
- Verify `JWT_SECRET` is set in `.env`
- Ensure secret is strong (32+ characters)

## 📚 Next Steps

1. ✅ Set up CI/CD pipeline
2. ✅ Configure SSL/HTTPS
3. ✅ Set up monitoring (PM2 Plus, New Relic, etc.)
4. ✅ Configure backup strategy
5. ✅ Set up staging environment
6. ✅ Performance testing
7. ✅ Security audit

## 🆘 Support

For issues or questions:
- Check logs: `logs/error.log`
- Review documentation: `README.md`
- Check GitHub issues

---

**Happy Coding! 🎉**

