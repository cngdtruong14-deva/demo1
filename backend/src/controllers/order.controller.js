/**
 * Order Controller
 * Manages order lifecycle and operations
 */

const { query, getConnection } = require('../config/database');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseFormatter');
const { deleteCache, CACHE_KEYS } = require('../config/redis');
const { ORDER_STATUS, SOCKET_EVENTS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * @route   POST /api/v1/orders
 * @desc    Create a new order
 * @access  Public
 */
async function createOrder(req, res, next) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    // Normalize camelCase to snake_case
    const table_id = req.body.table_id || req.body.tableId;
    let branch_id = req.body.branch_id || req.body.branchId;
    const customer_id = req.body.customer_id || req.body.customerId || null;
    const payment_method = req.body.payment_method || req.body.paymentMethod || 'cash';
    const notes = req.body.notes || null;

    // Normalize items: convert productId to product_id
    const items = (req.body.items || []).map(item => ({
      product_id: item.product_id || item.productId,
      quantity: item.quantity,
      notes: item.notes || null
    }));

    // Validate table_id
    if (!table_id) {
      throw new Error('table_id or tableId is required');
    }

    // Reject placeholder values
    const invalidTableIds = ['TABLE_UUID', 'table-uuid', 'table_uuid', 'demo-table-1', 'demo-table'];
    if (invalidTableIds.includes(table_id.toLowerCase())) {
      throw new Error(`Invalid table_id: ${table_id}. Please scan QR code to get a valid table ID.`);
    }

    // Get branch_id from table if not provided
    if (!branch_id) {
      const [tableData] = await connection.query(
        'SELECT branch_id FROM tables WHERE id = ?',
        [table_id]
      );
      if (tableData.length === 0) {
        throw new Error(`Table ${table_id} not found. Please scan QR code to get a valid table ID.`);
      }
      branch_id = tableData[0].branch_id;
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const [product] = await connection.query(
        'SELECT id, name, price FROM products WHERE id = ? AND status = "available"',
        [item.product_id]
      );

      if (product.length === 0) {
        throw new Error(`Product ${item.product_id} not available`);
      }

      const itemSubtotal = product[0].price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product_id: product[0].id,
        product_name: product[0].name,
        quantity: item.quantity,
        unit_price: product[0].price,
        subtotal: itemSubtotal,
        notes: item.notes || null
      });
    }

    const discount = 0; // TODO: Apply promotions
    const tax = subtotal * 0.1; // 10% VAT
    const total = subtotal - discount + tax;

    // Insert order
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
       (order_number, table_id, branch_id, customer_id, subtotal, discount, tax, total, 
        payment_method, payment_status, order_status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?)`,
      [orderNumber, table_id, branch_id, customer_id, subtotal, discount, tax, total, payment_method, notes]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items 
         (order_id, product_id, product_name, quantity, unit_price, subtotal, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [orderId, item.product_id, item.product_name, item.quantity, item.unit_price, item.subtotal, item.notes]
      );
    }

    // Update table status
    await connection.query('UPDATE tables SET status = "occupied" WHERE id = ?', [table_id]);

    await connection.commit();

    // Fetch table number for socket notification
    let tableNumber = 'N/A';
    try {
      const [tableData] = await connection.query('SELECT table_number FROM tables WHERE id = ?', [table_id]);
      if (tableData.length > 0) {
        tableNumber = tableData[0].table_number || table_id;
      }
    } catch (err) {
      logger.warn('Failed to fetch table number:', err.message);
      tableNumber = table_id; // Fallback to table_id
    }

    // 🔥 Emit socket event for new order
    if (global.io) {
      const orderData = {
        id: orderId,
        orderId,
        order_number: orderNumber,
        orderNumber,
        table_id,
        tableId: table_id,
        table_number: tableNumber,
        tableNumber,
        branch_id: branch_id || '1',
        branchId: branch_id || '1',
        total,
        total_amount: total,
        subtotal,
        tax,
        discount,
        items: orderItems.map(item => ({
          id: item.product_id,
          productId: item.product_id,
          product_id: item.product_id,
          productName: item.product_name,
          product_name: item.product_name,
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          status: 'pending',
          notes: item.notes,
          special_notes: item.notes
        })),
        orderItems: orderItems.map(item => ({
          id: item.product_id,
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
          status: 'pending',
          notes: item.notes
        })),
        status: 'confirmed',
        order_status: 'confirmed',
        payment_status: 'pending',
        notes,
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      const targetBranchId = branch_id || '1';
      const kitchenRoom = `kitchen-${targetBranchId}`;
      const branchRoom = `branch_${targetBranchId}`;

      // Debug: Check how many sockets are in the kitchen room
      const kitchenRoomSockets = global.io.sockets.adapter.rooms.get(kitchenRoom);
      const socketCount = kitchenRoomSockets ? kitchenRoomSockets.size : 0;
      logger.info(`📊 Kitchen room ${kitchenRoom} has ${socketCount} socket(s) connected`);

      // Emit to branch room (for general notifications)
      global.io.to(branchRoom).emit(SOCKET_EVENTS.NEW_ORDER, orderData);

      // Emit to kitchen room (for KDS - Kitchen Display System)
      global.io.to(kitchenRoom).emit(SOCKET_EVENTS.NEW_ORDER, orderData);

      // Also emit kitchen:new_order for compatibility
      global.io.to(kitchenRoom).emit('kitchen:new_order', orderData);

      logger.info(`🔥 New Order emitted: ${orderNumber} (ID: ${orderId}) to ${kitchenRoom}`);
      logger.info(`   Table: ${tableNumber}, Total: ${total.toLocaleString('vi-VN')}đ, Items: ${orderItems.length}`);
      logger.info(`   Branch ID: ${targetBranchId}, Room: ${kitchenRoom}, Connected sockets: ${socketCount}`);
    }

    logger.info(`Order created: ${orderNumber}`);

    return sendSuccess(
      res,
      {
        id: orderId,
        order_number: orderNumber,
        total,
        items: orderItems
      },
      'Order created successfully',
      201
    );
  } catch (error) {
    await connection.rollback();
    logger.error('Create order error:', error);
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;

    const [order] = await query(
      `SELECT 
        o.*,
        t.table_number,
        b.name as branch_name,
        c.name as customer_name,
        c.phone as customer_phone
       FROM orders o
       LEFT JOIN tables t ON o.table_id = t.id
       LEFT JOIN branches b ON o.branch_id = b.id
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = ?`,
      [id]
    );

    if (!order) {
      return sendError(res, 'Order not found', null, 404);
    }

    // Get order items
    const items = await query('SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC', [id]);

    return sendSuccess(res, { ...order, items }, 'Order retrieved successfully');
  } catch (error) {
    logger.error('Get order error:', error);
    next(error);
  }
}

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders with filters
 * @access  Private
 */
async function getAllOrders(req, res, next) {
  try {
    const { page = 1, limit = 20, branch_id, table_id, order_status, payment_status, from_date, to_date } = req.query;

    const offset = (page - 1) * limit;
    const whereConditions = [];
    const params = [];

    if (branch_id) {
      whereConditions.push('o.branch_id = ?');
      params.push(branch_id);
    }

    if (table_id) {
      whereConditions.push('o.table_id = ?');
      params.push(table_id);
    }

    if (order_status) {
      whereConditions.push('o.order_status = ?');
      params.push(order_status);
    }

    if (payment_status) {
      whereConditions.push('o.payment_status = ?');
      params.push(payment_status);
    }

    if (from_date) {
      whereConditions.push('DATE(o.created_at) >= ?');
      params.push(from_date);
    }

    if (to_date) {
      whereConditions.push('DATE(o.created_at) <= ?');
      params.push(to_date);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const [countResult] = await query(`SELECT COUNT(*) as total FROM orders o ${whereClause}`, params);
    const total = countResult.total;

    // Get orders
    const orders = await query(
      `SELECT 
        o.*,
        t.table_number,
        b.name as branch_name
       FROM orders o
       LEFT JOIN tables t ON o.table_id = t.id
       LEFT JOIN branches b ON o.branch_id = b.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return sendPaginated(res, orders, page, limit, total, 'Orders retrieved successfully');
  } catch (error) {
    logger.error('Get all orders error:', error);
    next(error);
  }
}

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Private
 */
async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    if (!Object.values(ORDER_STATUS).includes(order_status)) {
      return sendError(res, 'Invalid order status', null, 400);
    }

    await query('UPDATE orders SET order_status = ?, updated_at = NOW() WHERE id = ?', [order_status, id]);

    // Get updated order details
    const [order] = await query('SELECT * FROM orders WHERE id = ?', [id]);

    // Emit socket event
    if (global.io && order) {
      global.io.to(`branch_${order.branch_id}`).emit(SOCKET_EVENTS.ORDER_UPDATE, {
        order_id: id,
        order_status
      });
    }

    logger.info(`Order status updated: ${id} -> ${order_status}`);

    return sendSuccess(res, { id, order_status }, 'Order status updated successfully');
  } catch (error) {
    logger.error('Update order status error:', error);
    next(error);
  }
}

/**
 * @route   PATCH /api/v1/orders/:orderId/items/:itemId/status
 * @desc    Update order item status
 * @access  Private (Kitchen staff)
 */
async function updateOrderItemStatus(req, res, next) {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    await query('UPDATE order_items SET status = ?, updated_at = NOW() WHERE id = ? AND order_id = ?', [
      status,
      itemId,
      orderId
    ]);

    // Get order details
    const [order] = await query('SELECT branch_id FROM orders WHERE id = ?', [orderId]);

    // Emit socket event
    if (global.io && order) {
      global.io.to(`kitchen_${order.branch_id}`).emit(SOCKET_EVENTS.ITEM_STATUS_CHANGE, {
        order_id: orderId,
        item_id: itemId,
        status
      });
    }

    logger.info(`Order item status updated: ${itemId} -> ${status}`);

    return sendSuccess(res, { item_id: itemId, status }, 'Order item status updated');
  } catch (error) {
    logger.error('Update order item status error:', error);
    next(error);
  }
}

/**
 * @route   GET /api/v1/orders/kitchen/:branchId
 * @desc    Get active orders for kitchen display
 * @access  Private (Kitchen)
 */
async function getKitchenOrders(req, res, next) {
  try {
    const { branchId } = req.params;

    const orders = await query(
      `SELECT 
        o.id,
        o.order_number,
        o.created_at,
        t.table_number,
        o.notes,
        TIMESTAMPDIFF(MINUTE, o.created_at, NOW()) as elapsed_minutes
       FROM orders o
       LEFT JOIN tables t ON o.table_id = t.id
       WHERE o.branch_id = ?
         AND o.order_status IN ('pending', 'confirmed', 'preparing')
       ORDER BY o.created_at ASC`,
      [branchId]
    );

    // Get items for each order
    for (const order of orders) {
      order.items = await query('SELECT * FROM order_items WHERE order_id = ? ORDER BY status ASC, created_at ASC', [
        order.id
      ]);
    }

    return sendSuccess(res, orders, 'Kitchen orders retrieved successfully');
  } catch (error) {
    logger.error('Get kitchen orders error:', error);
    next(error);
  }
}

module.exports = {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderItemStatus,
  getKitchenOrders
};
