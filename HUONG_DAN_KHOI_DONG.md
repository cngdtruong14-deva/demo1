# Hướng dẫn khởi động MySQL và Redis

## 📋 Tổng quan

Dự án QR Order Platform sử dụng:

- **MySQL 8.0** - Database chính
- **Redis** - Cache và session storage

Có 2 cách để khởi động MySQL và Redis:

1. **Docker Compose** (Khuyến nghị - Dễ dàng nhất)
2. **Cài đặt thủ công** (Nếu không có Docker)

---

## 🐳 Cách 1: Sử dụng Docker Compose (Khuyến nghị)

### Yêu cầu

- Docker Desktop đã được cài đặt và đang chạy
- Docker Compose đã được cài đặt

### Các bước thực hiện

#### 1. Kiểm tra Docker đang chạy

```bash
docker --version
docker-compose --version
```

#### 2. Khởi động MySQL và Redis

```bash
# Từ thư mục root của dự án
cd D:\tailieu\phanmemmanguonmo\demo1\root

# Khởi động các services
docker-compose up -d

# Xem logs để kiểm tra
docker-compose logs -f
```

#### 3. Kiểm tra trạng thái

```bash
# Kiểm tra containers đang chạy
docker-compose ps

# Hoặc
docker ps
```

#### 4. Dừng services (khi cần)

```bash
docker-compose down

# Dừng và xóa volumes (xóa dữ liệu)
docker-compose down -v
```

### Thông tin kết nối

Sau khi khởi động thành công:

- **MySQL**:

  - Host: `localhost`
  - Port: `3306`
  - Database: `qr_order_db`
  - User: `root`
  - Password: `14032005`

- **Redis**:
  - Host: `localhost`
  - Port: `6379`
  - Password: (không có)

### Kiểm tra kết nối

#### Kiểm tra MySQL

```bash
# Vào container MySQL
docker exec -it restaurant-mysql mysql -u root -p
# Nhập password: 14032005

# Hoặc từ máy host (nếu đã cài MySQL client)
mysql -h localhost -P 3306 -u root -p
```

#### Kiểm tra Redis

```bash
# Vào container Redis
docker exec -it restaurant-redis redis-cli

# Test ping
redis-cli ping
# Kết quả: PONG
```

---

## 💻 Cách 2: Cài đặt thủ công

### Cài đặt MySQL 8.0

#### Windows

1. **Tải MySQL Installer**

   - Truy cập: https://dev.mysql.com/downloads/installer/
   - Tải MySQL Installer for Windows

2. **Cài đặt**

   - Chạy installer
   - Chọn "Developer Default" hoặc "Server only"
   - Thiết lập root password: `14032005`
   - Port mặc định: `3306`

3. **Tạo database**

   ```sql
   CREATE DATABASE qr_order_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Khởi động MySQL**
   - MySQL sẽ tự động khởi động như một Windows Service
   - Hoặc từ Services: `services.msc` → Tìm "MySQL80" → Start

#### Linux (Ubuntu/Debian)

```bash
# Cập nhật package list
sudo apt update

# Cài đặt MySQL
sudo apt install mysql-server -y

# Khởi động MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Thiết lập bảo mật
sudo mysql_secure_installation

# Đăng nhập MySQL
sudo mysql -u root -p

# Tạo database
CREATE DATABASE qr_order_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'root'@'localhost' IDENTIFIED BY '14032005';
GRANT ALL PRIVILEGES ON qr_order_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### macOS

```bash
# Sử dụng Homebrew
brew install mysql

# Khởi động MySQL
brew services start mysql

# Thiết lập root password
mysql_secure_installation

# Tạo database
mysql -u root -p
CREATE DATABASE qr_order_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Cài đặt Redis

#### Windows

1. **Sử dụng WSL2 (Khuyến nghị)**

   ```bash
   # Trong WSL2
   sudo apt update
   sudo apt install redis-server -y
   sudo service redis-server start
   ```

2. **Hoặc tải Redis for Windows**
   - Truy cập: https://github.com/microsoftarchive/redis/releases
   - Tải và cài đặt
   - Chạy `redis-server.exe`

#### Linux (Ubuntu/Debian)

```bash
# Cài đặt Redis
sudo apt update
sudo apt install redis-server -y

# Khởi động Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Kiểm tra
redis-cli ping
```

#### macOS

```bash
# Sử dụng Homebrew
brew install redis

# Khởi động Redis
brew services start redis

# Kiểm tra
redis-cli ping
```

---

## 🔧 Cấu hình

### File .env đã được cấu hình sẵn

Các file `.env` đã được cấu hình với:

- **DB_PASSWORD**: `14032005`
- **DB_HOST**: `localhost`
- **DB_PORT**: `3306`
- **DB_NAME**: `qr_order_db`
- **REDIS_HOST**: `localhost`
- **REDIS_PORT**: `6379`

### Kiểm tra kết nối từ Backend

Sau khi khởi động MySQL và Redis, kiểm tra kết nối:

```bash
cd backend
npm run dev
```

Backend sẽ tự động kiểm tra kết nối và hiển thị:

- ✅ Database connected successfully
- ✅ Redis connected successfully

---

## 🚨 Xử lý lỗi thường gặp

### MySQL không kết nối được

1. **Kiểm tra MySQL đang chạy**

   ```bash
   # Docker
   docker ps | grep mysql

   # Windows Service
   services.msc → Tìm MySQL80

   # Linux
   sudo systemctl status mysql
   ```

2. **Kiểm tra port 3306**

   ```bash
   # Windows
   netstat -an | findstr 3306

   # Linux/Mac
   lsof -i :3306
   ```

3. **Kiểm tra firewall**
   - Đảm bảo port 3306 không bị chặn

### Redis không kết nối được

1. **Kiểm tra Redis đang chạy**

   ```bash
   # Docker
   docker ps | grep redis

   # Linux
   sudo systemctl status redis-server

   # Test
   redis-cli ping
   ```

2. **Kiểm tra port 6379**

   ```bash
   # Windows
   netstat -an | findstr 6379

   # Linux/Mac
   lsof -i :6379
   ```

### Lỗi "Access denied"

- Kiểm tra lại mật khẩu trong file `.env`
- Đảm bảo mật khẩu MySQL root là `14032005`

---

## 📝 Lệnh hữu ích

### Docker Compose

```bash
# Khởi động
docker-compose up -d

# Dừng
docker-compose down

# Xem logs
docker-compose logs -f mysql
docker-compose logs -f redis

# Restart
docker-compose restart

# Xem trạng thái
docker-compose ps

# Xóa tất cả (bao gồm data)
docker-compose down -v
```

### MySQL

```bash
# Đăng nhập
mysql -h localhost -P 3306 -u root -p

# Xem databases
SHOW DATABASES;

# Sử dụng database
USE qr_order_db;

# Xem tables
SHOW TABLES;
```

### Redis

```bash
# Đăng nhập Redis CLI
redis-cli

# Test ping
PING

# Xem tất cả keys
KEYS *

# Xóa tất cả keys
FLUSHALL

# Thoát
EXIT
```

---

## ✅ Checklist khởi động

- [ ] Docker đã được cài đặt và đang chạy (nếu dùng Docker)
- [ ] MySQL đã được khởi động
- [ ] Redis đã được khởi động
- [ ] File `.env` đã được cấu hình đúng mật khẩu
- [ ] Kiểm tra kết nối MySQL thành công
- [ ] Kiểm tra kết nối Redis thành công
- [ ] Backend có thể kết nối đến MySQL và Redis

---

## 🎯 Bước tiếp theo

Sau khi MySQL và Redis đã chạy:

1. **Khởi tạo database schema**

   ```bash
   cd backend
   npm run migrate
   ```

2. **Seed dữ liệu mẫu** (tùy chọn)

   ```bash
   npm run seed
   ```

3. **Khởi động backend**

   ```bash
   npm run dev
   ```

4. **Khởi động frontend**

   ```bash
   # Terminal 1: Customer App
   cd frontend-customer
   npm run dev

   # Terminal 2: Admin App
   cd frontend-admin
   npm run dev
   ```

---

**Lưu ý**: Mật khẩu `14032005` đã được cấu hình trong tất cả các file `.env`. Đảm bảo MySQL và Redis sử dụng cùng mật khẩu này.
