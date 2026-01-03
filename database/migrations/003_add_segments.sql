-- Migration 003: Add Customer Segments
-- Add customer segmentation and loyalty tracking

-- Add customer segment column
ALTER TABLE customers 
ADD COLUMN segment ENUM('new', 'regular', 'vip', 'inactive') DEFAULT 'new' AFTER email,
ADD COLUMN loyalty_points INT DEFAULT 0 AFTER total_spent,
ADD COLUMN last_segment_update TIMESTAMP NULL AFTER updated_at;

-- Add index for segment queries
ALTER TABLE customers ADD INDEX idx_segment (segment);
ALTER TABLE customers ADD INDEX idx_loyalty_points (loyalty_points);

-- Create customer_segments view for analytics
CREATE OR REPLACE VIEW customer_segments AS
SELECT 
    segment,
    COUNT(*) as customer_count,
    AVG(total_orders) as avg_orders,
    AVG(total_spent) as avg_spent,
    SUM(total_spent) as total_revenue
FROM customers
GROUP BY segment;

