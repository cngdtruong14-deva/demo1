-- Migration 001: Create Core Tables
-- This migration creates the initial table structure

-- Note: This migration assumes the base schema from init.sql
-- Run init.sql first, then apply migrations in order

-- Add any additional tables or modifications here
-- Example: Adding a promotions table

CREATE TABLE IF NOT EXISTS promotions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dates (start_date, end_date),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

