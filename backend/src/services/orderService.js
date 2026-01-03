const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Table = require('../models/Table');
const Product = require('../models/Product');
const CustomerService = require('./customerService');
const { NotFoundError, ValidationError } = require('../utils/errors');

class OrderService {
  /**
   * Create a new order
   */
  static async createOrder(orderData) {
    const { tableId, customerId, items, notes } = orderData;

    // Validate table exists
    const table = await Table.findById(tableId);
    if (!table) {
      throw new NotFoundError('Table', tableId);
    }

    // Validate items
    if (!items || items.length === 0) {
      throw new ValidationError('Order must have at least one item');
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new NotFoundError('Product', item.productId);
      }

      if (product.status !== 'available') {
        throw new ValidationError(`Product "${product.name}" is not available`);
      }

      const unitPrice = parseFloat(product.price);
      const quantity = parseInt(item.quantity) || 1;
      const itemSubtotal = unitPrice * quantity;

      subtotal += itemSubtotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice,
        subtotal: itemSubtotal,
        notes: item.notes || null
      });
    }

    const discount = 0; // TODO: Apply promotions
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax - discount;

    // Create order
    const order = await Order.create({
      tableId,
      branchId: table.branch_id,
      customerId: customerId || null,
      subtotal,
      discount,
      tax,
      total,
      paymentMethod: 'cash',
      notes
    });

    // Create order items
    const orderItemsData = orderItems.map(item => ({
      ...item,
      orderId: order.id
    }));

    await OrderItem.createBatch(orderItemsData);

    // Update table status
    await Table.updateStatus(tableId, 'occupied');

    // Update customer stats if customer exists
    if (customerId) {
      await CustomerService.updateCustomerStats(customerId, total);
    }

    // Get full order details
    const fullOrder = await this.getOrderById(order.id);

    return fullOrder;
  }

  /**
   * Get order by ID with items
   */
  static async getOrderById(orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order', orderId);
    }

    const items = await OrderItem.findByOrderId(orderId);
    const timeline = await Order.getTimeline(orderId);

    return {
      id: order.id,
      orderNumber: order.order_number,
      table: {
        id: order.table_id,
        tableNumber: order.table_number
      },
      customer: order.customer_id ? {
        id: order.customer_id,
        name: order.customer_name,
        phone: order.customer_phone
      } : null,
      items: items.map(item => ({
        id: item.id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price),
        subtotal: parseFloat(item.subtotal),
        status: item.status,
        notes: item.notes
      })),
      subtotal: parseFloat(order.subtotal),
      discount: parseFloat(order.discount),
      tax: parseFloat(order.tax),
      total: parseFloat(order.total),
      paymentStatus: order.payment_status,
      orderStatus: order.order_status,
      createdAt: order.created_at,
      timeline
    };
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId, status, notes = null) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order', orderId);
    }

    const updatedOrder = await Order.updateStatus(orderId, status, notes);

    // If order is completed or cancelled, update table status
    if (status === 'completed' || status === 'cancelled') {
      await Table.updateStatus(order.table_id, 'available');
    }

    return this.getOrderById(orderId);
  }

  /**
   * Get order status (simplified for customer)
   */
  static async getOrderStatus(orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order', orderId);
    }

    return {
      id: order.id,
      orderNumber: order.order_number,
      status: order.order_status,
      estimatedTime: this.calculateEstimatedTime(order),
      createdAt: order.created_at
    };
  }

  /**
   * Calculate estimated preparation time
   */
  static calculateEstimatedTime(order) {
    // Default: 20 minutes
    // TODO: Calculate based on order items preparation_time
    return 20;
  }
}

module.exports = OrderService;

