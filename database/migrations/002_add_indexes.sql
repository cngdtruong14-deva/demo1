-- Migration 002: Add Performance Indexes
-- Optimize query performance with additional indexes

-- Add composite indexes for common query patterns
ALTER TABLE orders ADD INDEX idx_branch_status (branch_id, status);
ALTER TABLE orders ADD INDEX idx_table_status (table_id, status);
ALTER TABLE orders ADD INDEX idx_customer_created (customer_id, created_at);

-- Add indexes for date range queries
ALTER TABLE orders ADD INDEX idx_created_date (DATE(created_at));
ALTER TABLE orders ADD INDEX idx_completed_date (DATE(completed_at));

-- Add index for menu item search
ALTER TABLE menu_items ADD INDEX idx_category_status (category_id, status);
ALTER TABLE menu_items ADD INDEX idx_price_range (price);

-- Add index for order items status tracking
ALTER TABLE order_items ADD INDEX idx_order_status (order_id, status);

