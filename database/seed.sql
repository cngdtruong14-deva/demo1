-- Smart Restaurant Database Seed Data
-- Insert sample data for development and testing

-- Insert Branches
INSERT INTO branches (id, name, address, phone, email) VALUES
('branch-001', 'Cầu Giấy Branch', '123 Cầu Giấy, Hà Nội', '0241234567', 'caugiay@restaurant.com'),
('branch-002', 'Hoàn Kiếm Branch', '456 Hoàn Kiếm, Hà Nội', '0242345678', 'hoankiem@restaurant.com'),
('branch-003', 'Đống Đa Branch', '789 Đống Đa, Hà Nội', '0243456789', 'dongda@restaurant.com'),
('branch-004', 'Hai Bà Trưng Branch', '321 Hai Bà Trưng, Hà Nội', '0244567890', 'haibatrung@restaurant.com'),
('branch-005', 'Ba Đình Branch', '654 Ba Đình, Hà Nội', '0245678901', 'badinh@restaurant.com');

-- Insert Users
INSERT INTO users (id, email, password_hash, name, role, branch_id) VALUES
('user-001', 'admin@restaurant.com', '$2b$10$example_hash_here', 'Admin User', 'admin', NULL),
('user-002', 'manager1@restaurant.com', '$2b$10$example_hash_here', 'Manager Cầu Giấy', 'manager', 'branch-001'),
('user-003', 'staff1@restaurant.com', '$2b$10$example_hash_here', 'Staff Member 1', 'staff', 'branch-001'),
('user-004', 'kitchen1@restaurant.com', '$2b$10$example_hash_here', 'Kitchen Staff 1', 'staff', 'branch-001'),
('user-005', 'manager2@restaurant.com', '$2b$10$example_hash_here', 'Manager Hoàn Kiếm', 'manager', 'branch-002');

-- Insert Categories
INSERT INTO categories (id, name, description, icon, display_order) VALUES
('cat-001', 'Khai Vị', 'Các món khai vị truyền thống', '🥗', 1),
('cat-002', 'Món Chính', 'Các món chính đặc sắc', '🍲', 2),
('cat-003', 'Đồ Uống', 'Nước uống và đồ giải khát', '🥤', 3),
('cat-004', 'Tráng Miệng', 'Các món tráng miệng ngọt ngào', '🍰', 4),
('cat-005', 'Combo', 'Combo tiết kiệm cho gia đình', '🍱', 5);

-- Insert Products
INSERT INTO products (id, branch_id, category_id, name, description, price, cost_price, preparation_time, is_spicy, is_vegetarian, status, sold_count, rating) VALUES
('item-001', 'branch-001', 'cat-001', 'Gỏi Cuốn', 'Gỏi cuốn tươi ngon với tôm và thịt', 45000, 20000, 10, FALSE, FALSE, 'available', 150, 4.5),
('item-002', 'branch-001', 'cat-001', 'Nem Nướng', 'Nem nướng thơm ngon đặc biệt', 55000, 25000, 12, FALSE, FALSE, 'available', 120, 4.7),
('item-003', 'branch-001', 'cat-001', 'Chả Giò', 'Chả giò giòn tan với nhân thịt', 40000, 18000, 8, FALSE, FALSE, 'available', 200, 4.6),
('item-004', 'branch-001', 'cat-001', 'Salad Rau Củ', 'Salad rau củ tươi ngon', 35000, 15000, 5, FALSE, TRUE, 'available', 80, 4.3),
('item-005', 'branch-001', 'cat-001', 'Bánh Mì Pate', 'Bánh mì pate truyền thống', 30000, 12000, 5, FALSE, FALSE, 'available', 300, 4.8);

-- Insert Tables
INSERT INTO tables (id, branch_id, table_number, qr_code, capacity, status) VALUES
('table-001', 'branch-001', 'A01', 'QR-TABLE-A01-BR001', 4, 'available'),
('table-002', 'branch-001', 'A02', 'QR-TABLE-A02-BR001', 6, 'available'),
('table-003', 'branch-001', 'A03', 'QR-TABLE-A03-BR001', 2, 'occupied'),
('table-004', 'branch-001', 'B01', 'QR-TABLE-B01-BR001', 8, 'available'),
('table-005', 'branch-002', 'A01', 'QR-TABLE-A01-BR002', 4, 'available');

-- Insert Customers
INSERT INTO customers (id, name, phone, email, total_orders, total_spent, last_order_date) VALUES
('cust-001', 'Nguyễn Văn A', '0912345678', 'nguyenvana@email.com', 15, 2500000, '2024-01-15 18:30:00'),
('cust-002', 'Trần Thị B', '0923456789', 'tranthib@email.com', 8, 1200000, '2024-01-14 19:00:00'),
('cust-003', 'Lê Văn C', '0934567890', 'levanc@email.com', 25, 4500000, '2024-01-16 12:00:00'),
('cust-004', 'Phạm Thị D', '0945678901', 'phamthid@email.com', 5, 800000, '2024-01-13 20:00:00'),
('cust-005', 'Hoàng Văn E', '0956789012', 'hoangvane@email.com', 12, 2000000, '2024-01-15 13:30:00');

-- Insert Orders
INSERT INTO orders (id, order_number, branch_id, table_id, customer_id, order_status, subtotal, total, payment_method, payment_status) VALUES
('order-001', 'ORD-2024-001', 'branch-001', 'table-001', 'cust-001', 'completed', 175000, 185000, 'card', 'paid'),
('order-002', 'ORD-2024-002', 'branch-001', 'table-002', 'cust-002', 'served', 215000, 240000, 'card', 'paid'),
('order-003', 'ORD-2024-003', 'branch-001', 'table-003', 'cust-003', 'preparing', 290000, 320000, 'cash', 'pending'),
('order-004', 'ORD-2024-004', 'branch-002', 'table-005', 'cust-004', 'confirmed', 135000, 150000, 'card', 'pending'),
('order-005', 'ORD-2024-005', 'branch-001', 'table-001', 'cust-005', 'pending', 245000, 275000, 'card', 'pending');

-- Insert Order Items
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, subtotal, status) VALUES
('oi-001', 'order-001', 'item-001', 'Gỏi Cuốn', 2, 45000, 90000, 'served'),
('oi-002', 'order-001', 'item-002', 'Nem Nướng', 1, 55000, 55000, 'served'),
('oi-003', 'order-001', 'item-005', 'Bánh Mì Pate', 1, 30000, 30000, 'served'),
('oi-004', 'order-002', 'item-001', 'Gỏi Cuốn', 3, 45000, 135000, 'served'),
('oi-005', 'order-002', 'item-003', 'Chả Giò', 2, 40000, 80000, 'served'),
('oi-006', 'order-003', 'item-002', 'Nem Nướng', 4, 55000, 220000, 'preparing'),
('oi-007', 'order-003', 'item-004', 'Salad Rau Củ', 2, 35000, 70000, 'pending'),
('oi-008', 'order-004', 'item-005', 'Bánh Mì Pate', 3, 30000, 90000, 'pending'),
('oi-009', 'order-004', 'item-001', 'Gỏi Cuốn', 2, 45000, 90000, 'pending'),
('oi-010', 'order-005', 'item-002', 'Nem Nướng', 3, 55000, 165000, 'pending'),
('oi-011', 'order-005', 'item-003', 'Chả Giò', 2, 40000, 80000, 'pending');

