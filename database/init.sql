-- ============================================
-- QR Order Platform - Database Initialization
-- ============================================
-- This script creates all database tables, indexes, 
-- stored procedures, triggers, and views
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- ============================================
-- 1. BRANCHES (Chi nhánh)
-- ============================================
CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(200) NOT NULL,
  address VARCHAR(500) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(100),
  manager_id VARCHAR(36),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  opening_time TIME NOT NULL DEFAULT '08:00:00',
  closing_time TIME NOT NULL DEFAULT '22:00:00',
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. CATEGORIES (Danh mục món)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  display_order INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status_order (status, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. PRODUCTS (Sản phẩm/Món ăn)
-- Multi-tenancy: Added branch_id for chain model
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  branch_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2) DEFAULT NULL,
  image_url VARCHAR(500),
  preparation_time INT DEFAULT 15,
  calories INT DEFAULT NULL,
  is_spicy BOOLEAN DEFAULT FALSE,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  tags JSON DEFAULT NULL,
  status ENUM('available', 'out_of_stock', 'discontinued') DEFAULT 'available',
  sold_count INT DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_branch_category (branch_id, category_id),
  INDEX idx_category_status (category_id, status),
  INDEX idx_branch_status (branch_id, status),
  INDEX idx_sold_count (sold_count DESC),
  INDEX idx_rating (rating DESC),
  INDEX idx_display_order (display_order),
  FULLTEXT INDEX ft_name_desc (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TABLES (Bàn ăn)
-- ============================================
CREATE TABLE IF NOT EXISTS tables (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  branch_id VARCHAR(36) NOT NULL,
  table_number VARCHAR(10) NOT NULL,
  capacity INT NOT NULL DEFAULT 4,
  qr_code VARCHAR(500) UNIQUE NOT NULL,
  floor_number INT DEFAULT 1,
  zone VARCHAR(50),
  status ENUM('available', 'occupied', 'reserved', 'cleaning') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  UNIQUE KEY unique_table_branch (branch_id, table_number),
  INDEX idx_status (status),
  INDEX idx_branch_status (branch_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. SEGMENTS (Phân khúc khách hàng)
-- ============================================
CREATE TABLE IF NOT EXISTS segments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(50) NOT NULL,
  description TEXT,
  criteria JSON,
  color VARCHAR(7),
  discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. CUSTOMERS (Khách hàng)
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100),
  gender ENUM('male', 'female', 'other'),
  date_of_birth DATE,
  segment_id VARCHAR(36),
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0.00,
  avg_order_value DECIMAL(10, 2) DEFAULT 0.00,
  last_order_date TIMESTAMP NULL,
  favorite_products JSON,
  status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE SET NULL,
  INDEX idx_phone (phone),
  INDEX idx_segment (segment_id),
  INDEX idx_total_spent (total_spent DESC),
  INDEX idx_last_order (last_order_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. ORDERS (Đơn hàng)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  table_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36),
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0.00,
  tax DECIMAL(10, 2) DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('cash', 'card', 'vnpay', 'momo', 'zalopay') DEFAULT 'cash',
  payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  order_status ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_order_number (order_number),
  INDEX idx_table_status (table_id, order_status),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_branch_date (branch_id, created_at),
  INDEX idx_customer_date (customer_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. ORDER_ITEMS (Chi tiết đơn hàng)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  status ENUM('pending', 'preparing', 'ready', 'served') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. STAFF (Nhân viên)
-- ============================================
CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  branch_id VARCHAR(36) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  role ENUM('admin', 'manager', 'chef', 'waiter', 'cashier') NOT NULL,
  avatar_url VARCHAR(500),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  INDEX idx_email (email),
  INDEX idx_branch_role (branch_id, role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. USERS (Legacy/Alternative to staff)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'manager', 'staff', 'customer') NOT NULL,
  branch_id VARCHAR(36),
  refresh_token VARCHAR(500),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_branch (branch_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ============================================
-- 11. ACTIVITY_LOGS (Nhật ký hành vi)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(100),
  customer_id VARCHAR(36),
  product_id VARCHAR(36),
  action_type ENUM('view', 'add_to_cart', 'remove_from_cart', 'search', 'filter') NOT NULL,
  metadata JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_customer_action (customer_id, action_type, created_at),
  INDEX idx_product_action (product_id, action_type, created_at),
  INDEX idx_session (session_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. LOYALTY_POINTS (Điểm tích lũy)
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_points (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  customer_id VARCHAR(36) NOT NULL,
  points INT DEFAULT 0,
  tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
  points_earned INT DEFAULT 0,
  points_redeemed INT DEFAULT 0,
  last_transaction_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_customer (customer_id),
  INDEX idx_tier (tier),
  INDEX idx_points (points DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. INGREDIENTS (Nguyên liệu)
-- ============================================
CREATE TABLE IF NOT EXISTS ingredients (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  stock_quantity DECIMAL(10, 2) DEFAULT 0.00,
  min_stock_level DECIMAL(10, 2) DEFAULT 0.00,
  cost_per_unit DECIMAL(10, 2),
  supplier VARCHAR(200),
  status ENUM('in_stock', 'low_stock', 'out_of_stock') DEFAULT 'in_stock',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_stock (stock_quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 14. RECIPES (Công thức)
-- ============================================
CREATE TABLE IF NOT EXISTS recipes (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  product_id VARCHAR(36) NOT NULL,
  ingredient_id VARCHAR(36) NOT NULL,
  quantity_required DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT,
  UNIQUE KEY unique_product_ingredient (product_id, ingredient_id),
  INDEX idx_product (product_id),
  INDEX idx_ingredient (ingredient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 15. PROMOTIONS (Khuyến mãi)
-- ============================================
CREATE TABLE IF NOT EXISTS promotions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  code VARCHAR(50) UNIQUE,
  discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  max_discount DECIMAL(10, 2),
  applicable_to ENUM('all', 'category', 'product', 'segment') DEFAULT 'all',
  applicable_ids JSON,
  usage_limit INT DEFAULT NULL,
  usage_count INT DEFAULT 0,
  per_user_limit INT DEFAULT 1,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_code (code),
  INDEX idx_status_dates (status, start_date, end_date),
  INDEX idx_applicable (applicable_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 16. PROMOTION_USAGE (Lịch sử sử dụng khuyến mãi)
-- ============================================
CREATE TABLE IF NOT EXISTS promotion_usage (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  promotion_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_promotion_customer (promotion_id, customer_id),
  INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 17. PRODUCT_REVIEWS (Đánh giá món ăn)
-- ============================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  product_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  image_urls JSON,
  helpful_count INT DEFAULT 0,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  UNIQUE KEY unique_customer_product_order (customer_id, product_id, order_id),
  INDEX idx_product_rating (product_id, rating DESC),
  INDEX idx_status (status),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 18. NOTIFICATIONS (Thông báo)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  recipient_type ENUM('customer', 'staff', 'branch') NOT NULL,
  recipient_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('order', 'promotion', 'system', 'reminder') NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  data JSON,
  channel ENUM('in_app', 'email', 'sms', 'zalo') NOT NULL,
  status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_recipient (recipient_type, recipient_id, is_read),
  INDEX idx_status_sent (status, sent_at),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 19. INVENTORY_TRANSACTIONS (Giao dịch kho)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  ingredient_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36) NOT NULL,
  transaction_type ENUM('in', 'out', 'adjustment', 'waste') NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2),
  reference_type ENUM('purchase', 'order', 'manual', 'spoilage') NOT NULL,
  reference_id VARCHAR(36),
  notes TEXT,
  performed_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  INDEX idx_ingredient_branch (ingredient_id, branch_id),
  INDEX idx_created (created_at DESC),
  INDEX idx_reference (reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 20. SALES_REPORTS (Báo cáo doanh thu)
-- ============================================
CREATE TABLE IF NOT EXISTS sales_reports (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  branch_id VARCHAR(36) NOT NULL,
  report_date DATE NOT NULL,
  report_type ENUM('daily', 'weekly', 'monthly') NOT NULL,
  total_orders INT DEFAULT 0,
  completed_orders INT DEFAULT 0,
  cancelled_orders INT DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  total_discount DECIMAL(12, 2) DEFAULT 0,
  net_revenue DECIMAL(12, 2) DEFAULT 0,
  total_customers INT DEFAULT 0,
  new_customers INT DEFAULT 0,
  returning_customers INT DEFAULT 0,
  avg_order_value DECIMAL(10, 2) DEFAULT 0,
  top_products JSON,
  peak_hours JSON,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  UNIQUE KEY unique_branch_date_type (branch_id, report_date, report_type),
  INDEX idx_date_type (report_date DESC, report_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 21. AI_RECOMMENDATIONS (Gợi ý AI)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  customer_id VARCHAR(36),
  session_id VARCHAR(100),
  recommendation_type ENUM('product', 'combo', 'upsell', 'cross_sell') NOT NULL,
  recommended_items JSON NOT NULL,
  algorithm VARCHAR(50) NOT NULL,
  confidence_score DECIMAL(5, 4),
  context JSON,
  was_shown BOOLEAN DEFAULT FALSE,
  was_clicked BOOLEAN DEFAULT FALSE,
  was_purchased BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer_type (customer_id, recommendation_type),
  INDEX idx_session (session_id),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update product sold_count when order_item is created
DROP TRIGGER IF EXISTS trg_update_product_sold_count;
DELIMITER $$
CREATE TRIGGER trg_update_product_sold_count
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  UPDATE products
  SET sold_count = sold_count + NEW.quantity
  WHERE id = NEW.product_id;
END$$

-- Trigger: Update product rating when review is approved
DROP TRIGGER IF EXISTS trg_update_product_rating;
CREATE TRIGGER trg_update_product_rating
AFTER UPDATE ON product_reviews
FOR EACH ROW
BEGIN
  IF NEW.status = 'approved' AND (OLD.status != 'approved' OR OLD.status IS NULL) THEN
    UPDATE products
    SET rating = (
      SELECT AVG(rating)
      FROM product_reviews
      WHERE product_id = NEW.product_id
        AND status = 'approved'
    )
    WHERE id = NEW.product_id;
  END IF;
END$$

-- Trigger: Check ingredient stock level
DROP TRIGGER IF EXISTS trg_check_ingredient_stock;
CREATE TRIGGER trg_check_ingredient_stock
AFTER UPDATE ON ingredients
FOR EACH ROW
BEGIN
  IF NEW.stock_quantity <= NEW.min_stock_level AND NEW.stock_quantity > 0 THEN
    UPDATE ingredients
    SET status = 'low_stock'
    WHERE id = NEW.id;
  ELSEIF NEW.stock_quantity <= 0 THEN
    UPDATE ingredients
    SET status = 'out_of_stock'
    WHERE id = NEW.id;
  ELSE
    UPDATE ingredients
    SET status = 'in_stock'
    WHERE id = NEW.id;
  END IF;
END$$
DELIMITER ;

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER $$

-- Calculate daily revenue
DROP PROCEDURE IF EXISTS sp_calculate_daily_revenue;
CREATE PROCEDURE sp_calculate_daily_revenue(
  IN p_branch_id VARCHAR(36),
  IN p_date DATE
)
BEGIN
  SELECT 
    DATE(created_at) as report_date,
    COUNT(*) as total_orders,
    SUM(CASE WHEN order_status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
    SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
    SUM(total) as total_revenue,
    SUM(discount) as total_discount,
    SUM(total - discount) as net_revenue,
    AVG(total) as avg_order_value,
    COUNT(DISTINCT customer_id) as unique_customers
  FROM orders
  WHERE branch_id = p_branch_id
    AND DATE(created_at) = p_date
  GROUP BY DATE(created_at);
END$$

-- Update customer segment
DROP PROCEDURE IF EXISTS sp_update_customer_segment;
CREATE PROCEDURE sp_update_customer_segment(
  IN p_customer_id VARCHAR(36)
)
BEGIN
  DECLARE v_total_orders INT;
  DECLARE v_total_spent DECIMAL(12, 2);
  DECLARE v_last_order_days INT;
  DECLARE v_segment_id VARCHAR(36);
  
  SELECT 
    COUNT(*),
    COALESCE(SUM(total), 0),
    COALESCE(DATEDIFF(NOW(), MAX(created_at)), 999)
  INTO v_total_orders, v_total_spent, v_last_order_days
  FROM orders
  WHERE customer_id = p_customer_id
    AND order_status = 'completed';
  
  IF v_total_orders = 0 THEN
    SELECT id INTO v_segment_id FROM segments WHERE name = 'New' LIMIT 1;
  ELSEIF v_last_order_days > 30 THEN
    SELECT id INTO v_segment_id FROM segments WHERE name = 'Churned' LIMIT 1;
  ELSEIF v_total_spent > 5000000 AND v_total_orders >= 10 THEN
    SELECT id INTO v_segment_id FROM segments WHERE name = 'VIP' LIMIT 1;
  ELSEIF v_total_orders >= 5 THEN
    SELECT id INTO v_segment_id FROM segments WHERE name = 'Regular' LIMIT 1;
  ELSE
    SELECT id INTO v_segment_id FROM segments WHERE name = 'Casual' LIMIT 1;
  END IF;
  
  UPDATE customers
  SET 
    segment_id = v_segment_id,
    total_orders = v_total_orders,
    total_spent = v_total_spent,
    avg_order_value = v_total_spent / NULLIF(v_total_orders, 0),
    last_order_date = (SELECT MAX(created_at) FROM orders WHERE customer_id = p_customer_id AND order_status = 'completed')
  WHERE id = p_customer_id;
END$$

DELIMITER ;

-- ============================================
-- VIEWS
-- ============================================

-- Active Orders View
CREATE OR REPLACE VIEW v_active_orders AS
SELECT 
  o.id,
  o.order_number,
  t.table_number,
  b.name as branch_name,
  c.name as customer_name,
  c.phone as customer_phone,
  o.total,
  o.order_status,
  o.created_at,
  TIMESTAMPDIFF(MINUTE, o.created_at, NOW()) as elapsed_minutes
FROM orders o
INNER JOIN tables t ON o.table_id = t.id
INNER JOIN branches b ON o.branch_id = b.id
LEFT JOIN customers c ON o.customer_id = c.id
WHERE o.order_status IN ('pending', 'confirmed', 'preparing', 'ready');

-- Product Performance View
CREATE OR REPLACE VIEW v_product_performance AS
SELECT 
  p.id,
  p.name,
  c.name as category_name,
  p.price,
  p.cost_price,
  (p.price - COALESCE(p.cost_price, 0)) as profit_per_unit,
  CASE 
    WHEN p.price > 0 THEN ((p.price - COALESCE(p.cost_price, 0)) / p.price * 100)
    ELSE 0
  END as profit_margin,
  p.sold_count,
  (p.sold_count * (p.price - COALESCE(p.cost_price, 0))) as total_profit,
  p.rating,
  COUNT(DISTINCT pr.id) as review_count,
  p.status
FROM products p
INNER JOIN categories c ON p.category_id = c.id
LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.status = 'approved'
GROUP BY p.id;

-- Customer Lifetime Value View
CREATE OR REPLACE VIEW v_customer_ltv AS
SELECT 
  c.id,
  c.name,
  c.phone,
  s.name as segment,
  c.total_orders,
  c.total_spent,
  c.avg_order_value,
  DATEDIFF(NOW(), c.created_at) as customer_age_days,
  DATEDIFF(NOW(), COALESCE(c.last_order_date, c.created_at)) as days_since_last_order,
  CASE
    WHEN DATEDIFF(NOW(), c.created_at) > 0 
    THEN (c.total_spent / DATEDIFF(NOW(), c.created_at) * 365)
    ELSE 0
  END as projected_annual_value,
  lp.points as loyalty_points,
  lp.tier as loyalty_tier
FROM customers c
LEFT JOIN segments s ON c.segment_id = s.id
LEFT JOIN loyalty_points lp ON c.id = lp.customer_id
WHERE c.status = 'active';

-- ============================================
-- COMMIT TRANSACTION
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;
COMMIT;


