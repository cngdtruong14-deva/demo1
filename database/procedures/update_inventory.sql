-- Stored Procedure: Update Inventory
-- Updates inventory levels when orders are completed

DELIMITER //

CREATE PROCEDURE UpdateInventory(
    IN p_order_id VARCHAR(36)
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_menu_item_id VARCHAR(36);
    DECLARE v_quantity INT;
    
    DECLARE cur_order_items CURSOR FOR
        SELECT menu_item_id, quantity
        FROM order_items
        WHERE order_id = p_order_id AND status = 'served';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    START TRANSACTION;

    -- Note: This assumes an inventory table exists
    -- If inventory tracking is needed, create the table first:
    -- CREATE TABLE IF NOT EXISTS inventory (
    --     menu_item_id VARCHAR(36) PRIMARY KEY,
    --     quantity INT DEFAULT 0,
    --     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    -- );

    OPEN cur_order_items;

    read_loop: LOOP
        FETCH cur_order_items INTO v_menu_item_id, v_quantity;
        
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Update inventory (decrease quantity)
        -- UPDATE inventory 
        -- SET quantity = quantity - v_quantity,
        --     updated_at = CURRENT_TIMESTAMP
        -- WHERE menu_item_id = v_menu_item_id;

        -- For now, just log the update
        -- In production, implement actual inventory tracking
        INSERT INTO inventory_log (menu_item_id, quantity_change, order_id, created_at)
        VALUES (v_menu_item_id, -v_quantity, p_order_id, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE quantity_change = quantity_change - v_quantity;

    END LOOP;

    CLOSE cur_order_items;

    COMMIT;
END //

DELIMITER ;

-- Example usage:
-- CALL UpdateInventory('order-001');

