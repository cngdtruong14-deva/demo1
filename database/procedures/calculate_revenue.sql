-- Stored Procedure: Calculate Revenue
-- Calculates revenue for a given date range and branch

DELIMITER //

CREATE PROCEDURE CalculateRevenue(
    IN p_branch_id VARCHAR(36),
    IN p_start_date DATE,
    IN p_end_date DATE,
    OUT p_total_revenue DECIMAL(10, 2),
    OUT p_total_orders INT,
    OUT p_average_order_value DECIMAL(10, 2)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Calculate total revenue
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COUNT(*),
        COALESCE(AVG(total_amount), 0)
    INTO 
        p_total_revenue,
        p_total_orders,
        p_average_order_value
    FROM orders
    WHERE branch_id = p_branch_id
        AND status = 'completed'
        AND payment_status = 'paid'
        AND DATE(created_at) BETWEEN p_start_date AND p_end_date;

    COMMIT;
END //

DELIMITER ;

-- Example usage:
-- CALL CalculateRevenue('branch-001', '2024-01-01', '2024-01-31', @revenue, @orders, @avg);
-- SELECT @revenue, @orders, @avg;

