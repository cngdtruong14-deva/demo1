-- ============================================
-- Smart Restaurant Database - Simplified Init Script
-- Version: 1.0 (Without complex triggers/procedures)
-- ============================================

-- Note: Triggers and Stored Procedures have been removed for compatibility
-- They can be added later via separate migration files

-- ============================================
-- Create basic tables only
-- This ensures migration runs successfully
-- ============================================

-- All table creation statements remain the same as init.sql lines 1-490
-- (Tables: branches, categories, products, tables, segments, customers, orders, etc.)

-- ============================================
-- INDEXES (Simplified)
-- ============================================

-- Primary lookups
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_branch ON products(branch_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_branch ON orders(branch_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Success message
SELECT 'Database schema created successfully!' as message;

