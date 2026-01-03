/**
 * Order Validators
 * Joi schemas for order validation
 */

const Joi = require('joi');

/**
 * Create order schema
 * Accepts both camelCase (from frontend) and snake_case (backend standard)
 */
const createOrderSchema = Joi.object({
  // Accept both tableId and table_id
  tableId: Joi.string().optional(),
  table_id: Joi.string().optional(),
  // branch_id is optional - will be fetched from table if not provided
  branchId: Joi.string().optional(),
  branch_id: Joi.string().optional(),
  customerId: Joi.string().optional().allow(null, ''),
  customer_id: Joi.string().optional().allow(null, ''),
  items: Joi.array()
    .items(
      Joi.object({
        // Accept both productId and product_id
        productId: Joi.string().optional(),
        product_id: Joi.string().optional(),
        quantity: Joi.number().integer().min(1).required(),
        notes: Joi.string().optional().allow('', null),
      })
    )
    .min(1)
    .required(),
  notes: Joi.string().optional().allow('', null),
  paymentMethod: Joi.string()
    .valid('cash', 'card', 'vnpay', 'momo', 'zalopay')
    .optional(),
  payment_method: Joi.string()
    .valid('cash', 'card', 'vnpay', 'momo', 'zalopay')
    .optional(),
}).custom((value, helpers) => {
  // Ensure at least tableId or table_id is present
  if (!value.tableId && !value.table_id) {
    return helpers.error('any.required', { message: 'tableId or table_id is required' });
  }
  // Ensure at least productId or product_id is present in each item
  if (value.items) {
    for (const item of value.items) {
      if (!item.productId && !item.product_id) {
        return helpers.error('any.required', { message: 'productId or product_id is required in items' });
      }
    }
  }
  return value;
});

/**
 * Update order status schema
 */
const updateOrderStatusSchema = Joi.object({
  order_status: Joi.string()
    .valid('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled')
    .required(),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
};

