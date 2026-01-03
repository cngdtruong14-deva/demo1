# 🚀 QR Order Platform - Quick Start Guide

Hướng dẫn nhanh để chạy toàn bộ hệ thống Smart Restaurant.

## 📋 Tổng quan

Hệ thống bao gồm 3 phần chính:

1. **Backend API** (Node.js + Express + MySQL + Redis + Socket.io)
2. **Frontend Customer** (Next.js 14 - Khách hàng đặt món qua QR)
3. **Frontend Admin** (React + Vite - Portal quản lý cho nhà hàng)

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐       ┌──────────────┐       ┌─────────────────┐
│  Frontend       │       │   Backend    │       │    Database     │
│  Customer       │◄─────►│   API        │◄─────►│    MySQL        │
│  (Next.js)      │       │  (Node.js)   │       │    + Redis      │
│  Port: 3000     │       │  Port: 5000  │       └─────────────────┘
└─────────────────┘       └──────────────┘
                                 ▲
                                 │
                                 ▼
┌─────────────────┐       Socket.io (Real-time)
│  Frontend       │
│  Admin          │
│  (React+Vite)   │
│  Port: 3001     │
└─────────────────┘
```

## 📦 Yêu cầu hệ thống

- **Node.js**: >=18.0.0
- **npm**: >=9.0.0
- **MySQL**: 8.0+
- **Redis**: 7.0+ (optional, for caching)

## 🔧 Setup từng bước

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd root
```

### 2️⃣ Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env với thông tin database của bạn

# Initialize database
npm run migrate   # Tạo tables
npm run seed      # Insert sample data

# Start backend
npm run dev
```

**Backend sẽ chạy tại:** `http://localhost:5000`

### 3️⃣ Setup Frontend Customer

```bash
cd frontend-customer

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local nếu cần

# Start development server
npm run dev
```

**Frontend Customer sẽ chạy tại:** `http://localhost:3000`

### 4️⃣ Setup Frontend Admin

```bash
cd frontend-admin

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env nếu cần

# Start development server
npm run dev
```

**Frontend Admin sẽ chạy tại:** `http://localhost:3001`

## 🎯 Luồng sử dụng

### Khách hàng (Customer)

1. **Quét QR Code** → Truy cập `http://localhost:3000/qr/[tableId]`
2. **Tự động chuyển** → Menu page `/customer/menu`
3. **Chọn món** → Thêm vào giỏ hàng
4. **Checkout** → Xác nhận đơn hàng
5. **Theo dõi** → Xem trạng thái đơn hàng real-time

### Quản lý (Admin)

1. **Login** → `http://localhost:3001/login` (nếu đã implement)
2. **Kitchen Display** → Xem đơn hàng mới real-time
3. **Cập nhật trạng thái** → Đánh dấu món đang nấu/hoàn thành
4. **Analytics** → Xem báo cáo doanh thu
5. **Quản lý** → Products, Tables, Branches, etc.

## 🔌 Kết nối giữa các thành phần

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=restaurant_db
DB_USER=root
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend Customer `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Frontend Admin `.env`

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

## 🧪 Testing the System

### 1. Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# Get menu (if available)
curl http://localhost:5000/api/v1/menu/1
```

### 2. Test Customer Flow

1. Mở `http://localhost:3000/qr/table-001`
2. Kiểm tra redirect đến menu
3. Thêm món vào giỏ hàng
4. Checkout

### 3. Test Admin KDS

1. Mở `http://localhost:3001/orders/kitchen-display`
2. Place order từ Customer app
3. Xem order xuất hiện real-time trong KDS
4. Update item status (Start Cooking → Ready)

## 🐳 Docker (Optional)

### Run với Docker Compose

```bash
# Build và start tất cả services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop all
docker-compose down
```

`docker-compose.yml` (nếu có):

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: restaurant_db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mysql
      - redis

  frontend-customer:
    build: ./frontend-customer
    ports:
      - "3000:3000"
    depends_on:
      - backend

  frontend-admin:
    build: ./frontend-admin
    ports:
      - "3001:3001"
    depends_on:
      - backend
```

## 🔍 Troubleshooting

### Backend không kết nối được Database

```bash
# Check MySQL running
mysql -u root -p

# Test connection
mysql -u root -p -e "SHOW DATABASES;"

# Re-run migrations
cd backend
npm run migrate
```

### Frontend không gọi được API

- Kiểm tra Backend có đang chạy không (`http://localhost:5000`)
- Kiểm tra `.env` / `.env.local` có đúng `API_URL` không
- Kiểm tra CORS settings trong backend

### Socket.io không hoạt động

- Kiểm tra `SOCKET_URL` trong `.env`
- Mở DevTools → Network → WS tab
- Xem connection status trong KDS page

### Database migration lỗi `DELIMITER`

- File `database/init.sql` có DELIMITER statements
- mysql2 library không hỗ trợ DELIMITER
- **Fix**: Tách triggers/procedures ra file riêng hoặc remove DELIMITER

## 📚 Tài liệu chi tiết

- **Backend**: `backend/README.md`, `backend/QUICK_START.md`
- **Frontend Customer**: `frontend-customer/README_CUSTOMER.md`
- **Frontend Admin**: `frontend-admin/README_ADMIN.md`
- **Database**: `database/init.sql` (schema documentation)
- **API Docs**: `docs/api-documentation.md` (if available)

## 🎓 Demo Workflow

### Scenario: Khách hàng đặt món

1. **Customer**: Quét QR code bàn → `http://localhost:3000/qr/table-001`
2. **Customer**: Xem menu → Chọn "Phở Bò" (2 tô) + "Trà Đá" (1 ly)
3. **Customer**: Checkout → Đặt món
4. **Backend**: Nhận order → Lưu DB → Emit socket event `new_order`
5. **Admin KDS**: Tự động hiện order mới (không cần refresh)
6. **Admin KDS**: Click "Bắt đầu nấu" → Status: `cooking`
7. **Admin KDS**: Click "Hoàn thành" → Status: `ready`
8. **Customer**: Order status page tự động update → "Sẵn sàng"

## 📊 Sample Data

Sau khi chạy `npm run seed`, database sẽ có:

- **Branches**: 3 chi nhánh (Cầu Giấy, Hoàn Kiếm, Đống Đa)
- **Tables**: 20 bàn (mỗi chi nhánh ~7 bàn)
- **Categories**: 4 loại (Khai Vị, Món Chính, Đồ Uống, Tráng Miệng)
- **Products**: 20+ món ăn
- **Orders**: 5 đơn hàng mẫu
- **Customers**: 10 khách hàng

## 🚀 Production Deployment

### Backend

```bash
npm run build
NODE_ENV=production npm start

# Or with PM2
pm2 start ecosystem.config.js
```

### Frontend Customer

```bash
npm run build
npm start

# Or serve with nginx
```

### Frontend Admin

```bash
npm run build
npm run preview

# Or serve with nginx
```

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS in production
- [ ] Set secure cookies
- [ ] Enable rate limiting
- [ ] Sanitize user inputs
- [ ] Set proper CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable database backups

## 🎉 That's it!

Bạn đã có một hệ thống QR Order Platform đầy đủ với:

- ✅ Real-time order management
- ✅ Mobile-friendly customer app
- ✅ Professional admin portal
- ✅ Analytics dashboard
- ✅ Kitchen display system

**Happy coding!** 🚀

---

**Need Help?**

- Check documentation in each folder
- Review `IMPLEMENTATION_COMPLETE.md` files
- Open an issue on GitHub

**Last Updated**: January 2, 2025

