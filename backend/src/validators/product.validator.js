/**
 * Product Validators
 * Joi schemas for product validation
 */

const Joi = require('joi');

/**
 * Create product schema
 */
const createProductSchema = Joi.object({
  branch_id: Joi.string().required(),
  category_id: Joi.string().required(),
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().optional().allow(''),
  price: Joi.number().positive().required(),
  cost_price: Joi.number().positive().optional(),
  image_url: Joi.string().uri().optional(),
  preparation_time: Joi.number().integer().min(1).default(15),
  calories: Joi.number().integer().optional(),
  is_spicy: Joi.boolean().default(false),
  is_vegetarian: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string()).optional(),
});

/**
 * Update product schema
 */
const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  description: Joi.string().optional().allow(''),
  price: Joi.number().positive().optional(),
  cost_price: Joi.number().positive().optional(),
  image_url: Joi.string().uri().optional(),
  preparation_time: Joi.number().integer().min(1).optional(),
  calories: Joi.number().integer().optional(),
  is_spicy: Joi.boolean().optional(),
  is_vegetarian: Joi.boolean().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('available', 'out_of_stock', 'discontinued').optional(),
}).min(1);

module.exports = {
  createProductSchema,
  updateProductSchema,
};

