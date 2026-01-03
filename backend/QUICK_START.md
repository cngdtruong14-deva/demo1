# ⚡ Quick Start Guide

Get your backend up and running in 5 minutes!

## 🚀 Quick Setup (5 Steps)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
npm run setup
```
Follow the prompts to configure your `.env` file.

### 3. Start MySQL & Redis
```bash
# MySQL (Windows)
net start MySQL80

# MySQL (Linux/Mac)
sudo systemctl start mysql

# Redis (Windows - if installed)
redis-server

# Redis (Linux/Mac)
sudo systemctl start redis
```

### 4. Initialize Database
```bash
# Create database and tables
npm run migrate

# Seed sample data
npm run seed
```

### 5. Start Server
```bash
npm run dev
```

## ✅ Verify Installation

1. **Health Check:**
```bash
curl http://localhost:5000/health
```

2. **Test API:**
```bash
curl http://localhost:5000/api/v1/menu/branch-001
```

3. **Open Postman:**
   - Import `backend/tests/api/postman-collection.json`
   - Test endpoints

## 📝 Default Credentials (from seed data)

- **Email:** admin@restaurant.com
- **Password:** (check seed.sql or create new user)

## 🔗 Connect Frontend

### Frontend-Customer
```bash
cd ../frontend-customer
# .env.local already configured to http://localhost:5000/api/v1
npm run dev
```

### Frontend-Admin
```bash
cd ../frontend-admin
# .env already configured to http://localhost:5000/api/v1
npm run dev
```

## 🐛 Troubleshooting

**Port 5000 in use?**
```bash
# Change PORT in .env
PORT=5001
```

**Database connection failed?**
- Check MySQL is running
- Verify credentials in `.env`
- Test: `mysql -u root -p`

**Redis connection failed?**
- Check Redis is running
- Test: `redis-cli ping`

## 📚 Next Steps

- Read full guide: `SETUP_GUIDE.md`
- Test API: Import Postman collection
- Deploy: `npm run deploy production`

---

**Need help?** Check `SETUP_GUIDE.md` for detailed instructions.

