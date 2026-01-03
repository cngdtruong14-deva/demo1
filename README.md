# QR Order Platform

Hệ thống đặt món qua QR Code cho nhà hàng, quán ăn với đầy đủ tính năng quản lý, theo dõi đơn hàng real-time và tích hợp thanh toán.

## 📋 Mục lục

- [Tính năng](#tính-năng)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Tài liệu](#tài-liệu)
- [Development](#development)
- [Deployment](#deployment)
- [Đóng góp](#đóng-góp)
- [License](#license)

## ✨ Tính năng

### Cho Khách hàng
- 📱 Quét QR Code để xem menu và đặt món
- 🛒 Giỏ hàng và thanh toán trực tuyến
- 📊 Theo dõi trạng thái đơn hàng real-time
- ⭐ Đánh giá và phản hồi món ăn
- 🎁 Chương trình tích điểm khách hàng thân thiết

### Cho Quản lý
- 📊 Dashboard với thống kê chi tiết
- 🍽️ Quản lý menu, sản phẩm, danh mục
- 📦 Quản lý đơn hàng và bàn ăn
- 👥 Quản lý khách hàng và phân khúc
- 📈 Phân tích doanh thu và xu hướng
- 🎯 Quản lý khuyến mãi và chiến dịch
- 🏢 Quản lý nhiều chi nhánh

### Cho Bếp
- 🖥️ Kitchen Display System (KDS)
- 🔔 Thông báo đơn hàng mới real-time
- ⏱️ Quản lý thời gian chế biến
- 📋 Theo dõi trạng thái từng món
- 🚨 Cảnh báo đơn hàng chậm

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ Customer Web App │  │  Admin Portal    │            │
│  │  (Next.js)       │  │  (React + Vite)  │            │
│  └──────────────────┘  └──────────────────┘            │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              NGINX REVERSE PROXY                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              APPLICATION LAYER                           │
│  ┌──────────────┐  ┌──────────────┐                      │
│  │ REST API    │  │ WebSocket    │                      │
│  │ (Express.js)│  │ (Socket.io)  │                      │
│  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────┘
        │              │              │
        ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Redis   │  │  MySQL   │  │ External │
│  Cache   │  │ Database │  │ Services │
└──────────┘  └──────────┘  └──────────┘
```

### Technology Stack

**Backend:**
- Node.js 18+ (Express.js)
- MySQL 8.0
- Redis 7.0
- Socket.io (Real-time communication)
- JWT Authentication

**Frontend:**
- Next.js 14+ (Customer App)
- React 18+ + Vite (Admin Portal)
- Tailwind CSS
- Redux Toolkit

**Infrastructure:**
- Docker & Docker Compose
- Nginx (Reverse Proxy)
- GitHub Actions (CI/CD)

## 💻 Yêu cầu hệ thống

### Development
- **Node.js**: >= 18.x LTS
- **MySQL**: >= 8.0
- **Redis**: >= 7.0
- **Docker**: >= 24.0 (Optional but recommended)
- **Git**: >= 2.30

### Hardware
- **RAM**: Minimum 8GB, Recommended 16GB
- **Disk**: Minimum 20GB free space
- **CPU**: 4 cores recommended

## 🚀 Cài đặt

### 1. Clone Repository

```bash
git clone https://github.com/your-org/qr-order-platform.git
cd qr-order-platform
```

### 2. Setup với Docker (Khuyến nghị)

```bash
# Copy file environment
cp env.example .env

# Chỉnh sửa các biến môi trường trong .env
nano .env

# Khởi động tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f
```

### 3. Setup thủ công

Xem chi tiết trong [Development Setup Guide](./docs/development/setup-guide.md)

```bash
# Backend
cd backend
npm install
cp ../env.example .env
# Chỉnh sửa .env
npm run dev

# Frontend Customer
cd ../frontend-customer
npm install
cp .env.local.example .env.local
# Chỉnh sửa .env.local
npm run dev

# Frontend Admin
cd ../frontend-admin
npm install
cp .env.example .env
# Chỉnh sửa .env
npm run dev
```

### 4. Khởi tạo Database

```bash
# Với Docker
docker-compose exec mysql mysql -u root -p < database/init.sql
docker-compose exec mysql mysql -u root -p qr_order_db < database/seed.sql

# Hoặc thủ công
mysql -u root -p < database/init.sql
mysql -u root -p qr_order_db < database/seed.sql
```

## 📁 Cấu trúc dự án

```
root/
├── backend/              # Backend API Server
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   │   ├── controllers/  # Route controllers
│   │   │   ├── middlewares/  # Express middlewares
│   │   │   ├── models/       # Database models
│   │   │   ├── routes/       # API routes
│   │   │   ├── services/    # Business logic
│   │   │   ├── sockets/      # Socket.io handlers
│   │   │   └── utils/        # Utility functions
│   │   └── validators/    # Input validation
│   └── tests/            # Test files
│
├── frontend-customer/     # Customer-facing Next.js app
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   └── store/            # Redux store
│
├── frontend-admin/        # Admin portal (React + Vite)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── store/       # Redux store
│
├── database/             # Database scripts
│   ├── init.sql         # Database schema
│   ├── seed.sql         # Sample data
│   └── migrations/      # Database migrations
│
├── docs/                 # Documentation
│   ├── architecture/    # System architecture docs
│   ├── deployment/      # Deployment guides
│   ├── development/     # Development guides
│   └── user-guides/    # User manuals
│
└── docker-compose.yml    # Docker Compose configuration
```

## 📚 Tài liệu

Tất cả tài liệu chi tiết được lưu trong thư mục [`docs/`](./docs/):

- **[System Design](./docs/architecture/system-design.md)** - Kiến trúc hệ thống
- **[API Design](./docs/architecture/api-design.md)** - Thiết kế REST API
- **[Database Schema](./docs/architecture/database-schema.md)** - Cấu trúc database
- **[Real-time Flow](./docs/architecture/realtime-flow.md)** - Luồng giao tiếp real-time
- **[Setup Guide](./docs/development/setup-guide.md)** - Hướng dẫn cài đặt
- **[Coding Standards](./docs/development/coding-standards.md)** - Chuẩn code
- **[Docker Guide](./docs/deployment/docker-guide.md)** - Hướng dẫn Docker
- **[Cloud Deployment](./docs/deployment/cloud-deployment.md)** - Deploy lên cloud
- **[Scaling Strategy](./docs/deployment/scaling-strategy.md)** - Chiến lược mở rộng

### User Guides

- **[Customer Manual](./docs/user-guides/customer-manual.md)** - Hướng dẫn cho khách hàng
- **[Admin Manual](./docs/user-guides/admin-manual.md)** - Hướng dẫn quản trị
- **[Kitchen Manual](./docs/user-guides/kitchen-manual.md)** - Hướng dẫn cho bếp

## 🛠️ Development

### Chạy Development Server

```bash
# Với Docker
docker-compose up

# Hoặc thủ công
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend Customer
cd frontend-customer && npm run dev

# Terminal 3: Frontend Admin
cd frontend-admin && npm run dev
```

### Testing

```bash
# Backend tests
cd backend
npm test              # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e      # E2E tests

# Frontend tests
cd frontend-customer
npm test

cd frontend-admin
npm test
```

### Code Quality

```bash
# Linting
npm run lint

# Format code
npm run format

# Type checking (TypeScript)
npm run type-check
```

## 🚢 Deployment

### Docker Deployment

Xem chi tiết trong [Docker Guide](./docs/deployment/docker-guide.md)

```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Cloud Deployment

Hướng dẫn deploy lên AWS, GCP, DigitalOcean: [Cloud Deployment Guide](./docs/deployment/cloud-deployment.md)

## 🔐 Environment Variables

Xem file [`env.example`](./env.example) để biết các biến môi trường cần thiết.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Xem [Coding Standards](./docs/development/coding-standards.md) để biết quy tắc code.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend**: Node.js/Express.js
- **Frontend**: Next.js, React
- **Database**: MySQL, Redis
- **DevOps**: Docker, Nginx

## 📞 Support

- 📧 Email: support@qrorder.com
- 📖 Documentation: [docs/](./docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/qr-order-platform/issues)

---

Made with ❤️ by QR Order Platform Team

