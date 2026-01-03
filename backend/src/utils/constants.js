/**
 * Constants
 * Application-wide constants and enums
 */

module.exports = {
  // User Roles
  USER_ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    STAFF: 'staff',
    CHEF: 'chef',
    WAITER: 'waiter',
    CASHIER: 'cashier',
    CUSTOMER: 'customer',
  },

  // Order Status
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    SERVED: 'served',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },

  // Order Item Status
  ORDER_ITEM_STATUS: {
    PENDING: 'pending',
    PREPARING: 'preparing',
    READY: 'ready',
    SERVED: 'served',
  },

  // Payment Methods
  PAYMENT_METHODS: {
    CASH: 'cash',
    CARD: 'card',
    VNPAY: 'vnpay',
    MOMO: 'momo',
    ZALOPAY: 'zalopay',
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    REFUNDED: 'refunded',
  },

  // Table Status
  TABLE_STATUS: {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    RESERVED: 'reserved',
    CLEANING: 'cleaning',
  },

  // Product Status
  PRODUCT_STATUS: {
    AVAILABLE: 'available',
    OUT_OF_STOCK: 'out_of_stock',
    DISCONTINUED: 'discontinued',
  },

  // Branch Status
  BRANCH_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    MAINTENANCE: 'maintenance',
  },

  // Customer Segments
  CUSTOMER_SEGMENTS: {
    NEW: 'New',
    CASUAL: 'Casual',
    REGULAR: 'Regular',
    VIP: 'VIP',
    CHURNED: 'Churned',
  },

  // Loyalty Tiers
  LOYALTY_TIERS: {
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    PLATINUM: 'platinum',
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    ORDER: 'order',
    PROMOTION: 'promotion',
    SYSTEM: 'system',
    REMINDER: 'reminder',
  },

  // Socket Events
  SOCKET_EVENTS: {
    // Order events
    NEW_ORDER: 'new_order',
    ORDER_UPDATE: 'order_update',
    ORDER_CANCELLED: 'order_cancelled',
    
    // Kitchen events
    KITCHEN_UPDATE: 'kitchen_update',
    ITEM_STATUS_CHANGE: 'item_status_change',
    
    // Table events
    TABLE_STATUS_CHANGE: 'table_status_change',
    
    // Notification events
    NOTIFICATION: 'notification',
  },

  // Cache Keys
  CACHE_KEYS: {
    MENU: (branchId) => `menu:${branchId}`,
    PRODUCT: (productId) => `product:${productId}`,
    TABLE: (tableId) => `table:${tableId}`,
    BRANCH: (branchId) => `branch:${branchId}`,
    CUSTOMER: (customerId) => `customer:${customerId}`,
    ACTIVE_ORDERS: (branchId) => `active_orders:${branchId}`,
  },

  // Cache TTL (in seconds)
  CACHE_TTL: {
    SHORT: 300,        // 5 minutes
    MEDIUM: 1800,      // 30 minutes
    LONG: 3600,        // 1 hour
    VERY_LONG: 86400,  // 24 hours
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // Time Constants
  TIME: {
    ONE_MINUTE: 60,
    ONE_HOUR: 3600,
    ONE_DAY: 86400,
    ONE_WEEK: 604800,
    ONE_MONTH: 2592000,
  },
};

