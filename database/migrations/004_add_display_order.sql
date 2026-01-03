-- Migration 004: Add display_order to products table
-- Add display_order column for custom product ordering

ALTER TABLE products 
ADD COLUMN display_order INT DEFAULT 0 AFTER rating;

-- Add index for efficient ordering queries
ALTER TABLE products ADD INDEX idx_display_order (display_order);

