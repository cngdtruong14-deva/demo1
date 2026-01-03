# 📖 Hướng Dẫn Nạp Menu vào Database

## 🎯 Tổng Quan

Script `seed-menu.js` sẽ đọc file JSON chứa menu và nạp vào database MySQL. Script sẽ tự động:
- Tạo branch mặc định nếu chưa có
- Tạo categories (danh mục)
- Tạo products (món ăn) với đầy đủ thông tin

## 📋 Yêu Cầu

1. **Database đã được khởi tạo:**
   ```bash
   # Nếu dùng Docker
   docker-compose up -d mysql
   
   # Hoặc đã chạy MySQL thủ công
   ```

2. **File menu JSON** có sẵn tại:
   - `docs/development/sample-data/menu.json` (menu mẫu)
   - `docs/development/sample-data/menu-quannhautudo.json` (menu quán nhậu tự do)

3. **Backend dependencies đã cài:**
   ```bash
   cd backend
   npm install
   ```

## 🚀 Cách 1: Nạp Menu Mặc Định (Đơn Giản Nhất)

### Bước 1: Đảm bảo MySQL đang chạy

```bash
# Kiểm tra MySQL container
docker-compose ps mysql

# Hoặc nếu chạy thủ công, đảm bảo MySQL đang chạy
```

### Bước 2: Chạy script seed

```bash
cd backend
node scripts/seed-menu.js
```

Script sẽ:
- Tự động tìm file `menu.json` tại `docs/development/sample-data/menu.json`
- Tạo branch mặc định nếu chưa có
- Nạp tất cả categories và products

### Kết quả:

```
🚀 Starting menu seeding process...

📊 Database Config:
   Host: localhost:3306
   Database: qr_order_db

🔌 Connecting to database...
✅ Connected to database

✅ Loaded menu file: Nhà Hàng Việt Nam Mẫu
   Categories: 4
   Products: 20

✅ Created default branch
✅ Branch ID: <uuid>

📁 Seeding 4 categories...
  ✓ Khai Vị
  ✓ Món Chính
  ✓ Đồ Uống
  ✓ Tráng Miệng
✅ Inserted 4 categories

🍽️  Seeding 20 products...
  ✓ Gỏi Cuốn Tôm Thịt
  ✓ Nem Nướng Nha Trang
  ...
✅ Inserted 20 products, 0 errors

✅ Menu seeding completed successfully!

📝 Summary:
   Branch ID: <uuid>
   Categories: 4
   Products: 20
```

## 🎯 Cách 2: Nạp Menu Từ File Tùy Chỉnh

### Nạp menu từ file khác:

```bash
cd backend
node scripts/seed-menu.js ../docs/development/sample-data/menu-quannhautudo.json
```

## 🏢 Cách 3: Nạp Menu Vào Branch Cụ Thể

### Bước 1: Lấy Branch ID

```bash
# Kết nối MySQL
mysql -u root -p qr_order_db

# Hoặc qua Docker
docker-compose exec mysql mysql -u root -p qr_order_db
```

```sql
-- Xem danh sách branches
SELECT id, name, status FROM branches;

-- Copy branch ID bạn muốn sử dụng
```

### Bước 2: Nạp menu với Branch ID

```bash
cd backend
node scripts/seed-menu.js ../docs/development/sample-data/menu.json <branch-uuid>
```

Ví dụ:
```bash
node scripts/seed-menu.js ../docs/development/sample-data/menu.json 550e8400-e29b-41d4-a716-446655440000
```

## ⚙️ Cấu Hình Database

Script sử dụng các biến môi trường sau (có thể đặt trong `.env`):

```bash
# .env file
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=qr_order_db
```

### Nếu dùng Docker:

Script tự động kết nối với MySQL container qua `localhost:3306`.

### Nếu MySQL chạy ở nơi khác:

```bash
# Set environment variables
export DB_HOST=your-mysql-host
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your-password
export DB_NAME=qr_order_db

# Chạy script
node scripts/seed-menu.js
```

## 📁 Cấu Trúc File Menu JSON

File menu JSON cần có cấu trúc như sau:

```json
{
  "metadata": {
    "version": "1.0.0",
    "restaurant_name": "Tên nhà hàng",
    "description": "Mô tả",
    "created_at": "2025-01-15"
  },
  "categories": [
    {
      "id": "cat-001",
      "name": "Khai Vị",
      "description": "Mô tả danh mục",
      "icon": "🥗",
      "display_order": 1,
      "status": "active"
    }
  ],
  "products": [
    {
      "id": "prod-001",
      "category_id": "cat-001",
      "name": "Tên món ăn",
      "description": "Mô tả món",
      "price": 45000,
      "cost_price": 20000,
      "image_url": "https://example.com/image.jpg",
      "preparation_time": 10,
      "calories": 180,
      "is_spicy": false,
      "is_vegetarian": false,
      "tags": ["best-seller", "signature"],
      "status": "available",
      "sold_count": 0,
      "rating": 0.00
    }
  ]
}
```

## ✅ Kiểm Tra Kết Quả

### Xem categories đã nạp:

```sql
SELECT id, name, icon, display_order, status FROM categories ORDER BY display_order;
```

### Xem products đã nạp:

```sql
SELECT 
  p.id, 
  p.name, 
  p.price, 
  c.name as category_name,
  p.status
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY c.display_order, p.name;
```

### Xem branch và số lượng products:

```sql
SELECT 
  b.id,
  b.name,
  COUNT(p.id) as product_count
FROM branches b
LEFT JOIN products p ON b.id = p.branch_id
GROUP BY b.id, b.name;
```

## 🔄 Cập Nhật Menu

Script hỗ trợ **upsert** (insert hoặc update):
- Nếu category/product đã tồn tại → **Cập nhật**
- Nếu chưa tồn tại → **Thêm mới**

Chạy lại script sẽ cập nhật dữ liệu:

```bash
node scripts/seed-menu.js
```

## 🐛 Xử Lý Lỗi

### Lỗi: "Cannot connect to MySQL"

**Nguyên nhân:** MySQL chưa chạy hoặc thông tin kết nối sai

**Giải pháp:**
```bash
# Kiểm tra MySQL container
docker-compose ps mysql

# Khởi động MySQL
docker-compose up -d mysql

# Đợi MySQL sẵn sàng (khoảng 10-20 giây)
docker-compose logs mysql
```

### Lỗi: "Category not found for product"

**Nguyên nhân:** Product có `category_id` không khớp với categories trong file

**Giải pháp:** Kiểm tra file JSON, đảm bảo tất cả `category_id` trong products đều có trong `categories`

### Lỗi: "Branch with ID ... not found"

**Nguyên nhân:** Branch ID không tồn tại trong database

**Giải pháp:**
```bash
# Tạo branch mới hoặc bỏ qua branch ID để script tự tạo
node scripts/seed-menu.js ../docs/development/sample-data/menu.json
```

## 📝 Ví Dụ Đầy Đủ

### Scenario 1: Lần đầu nạp menu

```bash
# 1. Khởi động MySQL
docker-compose up -d mysql

# 2. Đợi MySQL sẵn sàng (kiểm tra logs)
docker-compose logs -f mysql
# Đợi thấy: "ready for connections"

# 3. Nạp menu
cd backend
node scripts/seed-menu.js

# 4. Kiểm tra kết quả
docker-compose exec mysql mysql -u root -p qr_order_db -e "SELECT COUNT(*) as total_products FROM products;"
```

### Scenario 2: Nạp menu vào nhiều branches

```bash
# Branch 1
node scripts/seed-menu.js ../docs/development/sample-data/menu.json <branch-1-uuid>

# Branch 2
node scripts/seed-menu.js ../docs/development/sample-data/menu-quannhautudo.json <branch-2-uuid>
```

## 🎯 Tips

1. **Backup trước khi nạp:**
   ```bash
   ./scripts/backup.sh dev
   ```

2. **Kiểm tra file JSON trước:**
   ```bash
   # Validate JSON syntax
   node -e "JSON.parse(require('fs').readFileSync('../docs/development/sample-data/menu.json', 'utf8')); console.log('✅ JSON valid');"
   ```

3. **Xem log chi tiết:**
   Script sẽ hiển thị từng category và product được nạp thành công.

4. **Sử dụng branch ID từ output:**
   Sau khi chạy script, copy Branch ID từ output để dùng cho frontend:
   ```
   ✅ Branch ID: 550e8400-e29b-41d4-a716-446655440000
   ```

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker-compose logs mysql`
2. Kiểm tra kết nối: `docker-compose exec mysql mysql -u root -p -e "SELECT 1;"`
3. Xem file README: `backend/scripts/README.md`

