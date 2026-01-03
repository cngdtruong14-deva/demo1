/**
 * Sample Data Loader
 * Load menu data from JSON files in docs/development/sample-data
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Path to sample data directory
const SAMPLE_DATA_DIR = path.join(__dirname, '../../docs/development/sample-data');

/**
 * Load sample menu from JSON file
 * @param {string} filename - Name of JSON file (default: 'menu.json')
 * @returns {Object} Menu data with categories and products
 */
function loadSampleMenu(filename = 'menu.json') {
  try {
    const filePath = path.join(SAMPLE_DATA_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      logger.warn(`Sample data file not found: ${filePath}`);
      return null;
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const menuData = JSON.parse(rawData);

    logger.info(`Sample menu loaded from ${filename}: ${menuData.products?.length || 0} products`);
    
    return menuData;
  } catch (error) {
    logger.error(`Error loading sample menu from ${filename}:`, error);
    return null;
  }
}

/**
 * Transform sample data to API format
 * @param {Object} sampleData - Raw sample data from JSON
 * @param {string} branchId - Branch ID to assign to products
 * @returns {Object} Transformed menu data
 */
function transformSampleMenu(sampleData, branchId = 'demo-branch-1') {
  if (!sampleData) return null;

  const { metadata, categories, products } = sampleData;

  // Group products by category
  const categoryMap = new Map();
  
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      product_count: 0,
      products: [],
    });
  });

  // Assign products to categories
  products.forEach(product => {
    const category = categoryMap.get(product.category_id);
    if (category) {
      // Transform product format
      const transformedProduct = {
        ...product,
        branch_id: branchId,
        // Parse tags if it's a string
        tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : (product.tags || []),
        // Ensure numeric types
        price: parseFloat(product.price) || 0,
        cost_price: product.cost_price ? parseFloat(product.cost_price) : null,
        preparation_time: product.preparation_time ? parseInt(product.preparation_time) : null,
        calories: product.calories ? parseInt(product.calories) : null,
        sold_count: parseInt(product.sold_count) || 0,
        rating: parseFloat(product.rating) || 0,
        // Ensure boolean types
        is_spicy: Boolean(product.is_spicy),
        is_vegetarian: Boolean(product.is_vegetarian),
      };

      category.products.push(transformedProduct);
      category.product_count++;
    }
  });

  const transformedCategories = Array.from(categoryMap.values())
    .filter(cat => cat.product_count > 0) // Only include categories with products
    .sort((a, b) => a.display_order - b.display_order);

  return {
    branch: {
      id: branchId,
      name: metadata?.restaurant_name || 'Nhà Hàng Mẫu',
      address: '123 Đường Mẫu, Quận 1, TP.HCM',
      phone: '0123456789',
    },
    categories: transformedCategories,
    metadata: {
      total_categories: transformedCategories.length,
      total_products: products.length,
      source: metadata?.source || 'sample-data',
      version: metadata?.version || '1.0.0',
      generated_at: new Date().toISOString(),
    },
  };
}

/**
 * Get available sample menu files
 * @returns {Array<string>} List of available menu JSON files
 */
function getAvailableMenuFiles() {
  try {
    if (!fs.existsSync(SAMPLE_DATA_DIR)) {
      return [];
    }

    const files = fs.readdirSync(SAMPLE_DATA_DIR);
    return files.filter(file => file.endsWith('.json') && file.includes('menu'));
  } catch (error) {
    logger.error('Error reading sample data directory:', error);
    return [];
  }
}

/**
 * Load and transform menu by filename
 * @param {string} filename - Menu filename
 * @param {string} branchId - Branch ID
 * @returns {Object|null} Transformed menu data
 */
function getSampleMenu(filename = 'menu.json', branchId = 'demo-branch-1') {
  const rawData = loadSampleMenu(filename);
  if (!rawData) return null;
  
  return transformSampleMenu(rawData, branchId);
}

module.exports = {
  loadSampleMenu,
  transformSampleMenu,
  getSampleMenu,
  getAvailableMenuFiles,
  SAMPLE_DATA_DIR,
};

