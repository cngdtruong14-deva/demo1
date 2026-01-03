/**
 * Seed Menu Data Script
 * Reads menu.json and inserts data into MySQL database
 * 
 * Usage: node scripts/seed-menu.js [menu-file-path] [branch-id]
 * Example: node scripts/seed-menu.js ../docs/development/sample-data/menu.json
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'qr_order_db',
  multipleStatements: true
};

// Get command line arguments
const menuFilePath = process.argv[2] || path.join(__dirname, '../../docs/development/sample-data/menu.json');
const branchId = process.argv[3] || null;

/**
 * Load and parse menu JSON file
 */
function loadMenuFile(filePath) {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    console.log(`📖 Reading menu file: ${fullPath}`);
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('❌ Error reading menu file:', error.message);
    process.exit(1);
  }
}

/**
 * Create or get default branch
 */
async function ensureBranch(connection) {
  if (branchId) {
    const [rows] = await connection.execute(
      'SELECT id FROM branches WHERE id = ?',
      [branchId]
    );
    if (rows.length === 0) {
      throw new Error(`Branch with ID ${branchId} not found. Please create branch first.`);
    }
    return branchId;
  }

  // Create default branch if not exists
  const [existing] = await connection.execute(
    'SELECT id FROM branches WHERE name = ? LIMIT 1',
    ['Default Branch']
  );

  if (existing.length > 0) {
    console.log('✅ Using existing default branch');
    return existing[0].id;
  }

  const newBranchId = uuidv4();
  await connection.execute(
    `INSERT INTO branches (id, name, address, phone, status) 
     VALUES (?, ?, ?, ?, ?)`,
    [newBranchId, 'Default Branch', '123 Main Street', '0243-xxx-xxxx', 'active']
  );
  console.log('✅ Created default branch');
  return newBranchId;
}

/**
 * Insert categories
 */
async function seedCategories(connection, categories, branchId) {
  console.log(`\n📁 Seeding ${categories.length} categories...`);
  
  const categoryMap = new Map(); // Map old ID to new UUID

  for (const cat of categories) {
    const newId = uuidv4();
    categoryMap.set(cat.id, newId);

    try {
      await connection.execute(
        `INSERT INTO categories (id, name, description, icon, display_order, status)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           description = VALUES(description),
           icon = VALUES(icon),
           display_order = VALUES(display_order),
           status = VALUES(status)`,
        [
          newId,
          cat.name,
          cat.description || null,
          cat.icon || null,
          cat.display_order || 0,
          cat.status || 'active'
        ]
      );
      console.log(`  ✓ ${cat.name}`);
    } catch (error) {
      console.error(`  ✗ Error inserting category ${cat.name}:`, error.message);
    }
  }

  console.log(`✅ Inserted ${categories.length} categories`);
  return categoryMap;
}

/**
 * Insert products
 */
async function seedProducts(connection, products, categoryMap, branchId) {
  console.log(`\n🍽️  Seeding ${products.length} products...`);

  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    const newCategoryId = categoryMap.get(product.category_id);
    
    if (!newCategoryId) {
      console.error(`  ✗ Category ${product.category_id} not found for product ${product.name}`);
      errorCount++;
      continue;
    }

    try {
      // Convert tags array to JSON string
      const tagsJson = product.tags && Array.isArray(product.tags) 
        ? JSON.stringify(product.tags) 
        : null;

      // Map status
      let dbStatus = 'available';
      if (product.status === 'out_of_stock') dbStatus = 'out_of_stock';
      if (product.status === 'discontinued') dbStatus = 'discontinued';

      await connection.execute(
        `INSERT INTO products (
          id, branch_id, category_id, name, description, price, cost_price,
          image_url, preparation_time, calories, is_spicy, is_vegetarian,
          tags, status, sold_count, rating
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          description = VALUES(description),
          price = VALUES(price),
          cost_price = VALUES(cost_price),
          image_url = VALUES(image_url),
          preparation_time = VALUES(preparation_time),
          calories = VALUES(calories),
          is_spicy = VALUES(is_spicy),
          is_vegetarian = VALUES(is_vegetarian),
          tags = VALUES(tags),
          status = VALUES(status)`,
        [
          product.id || uuidv4(),
          branchId,
          newCategoryId,
          product.name,
          product.description || null,
          product.price,
          product.cost_price || null,
          product.image_url || null,
          product.preparation_time || 15,
          product.calories || null,
          product.is_spicy || false,
          product.is_vegetarian || false,
          tagsJson,
          dbStatus,
          product.sold_count || 0,
          product.rating || 0.00
        ]
      );
      console.log(`  ✓ ${product.name}`);
      successCount++;
    } catch (error) {
      console.error(`  ✗ Error inserting product ${product.name}:`, error.message);
      errorCount++;
    }
  }

  console.log(`✅ Inserted ${successCount} products, ${errorCount} errors`);
}

/**
 * Main seeding function
 */
async function seedMenu() {
  let connection;

  try {
    console.log('🚀 Starting menu seeding process...\n');
    console.log('📊 Database Config:');
    console.log(`   Host: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    console.log(`   Database: ${DB_CONFIG.database}\n`);

    // Connect to database
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to database\n');

    // Load menu file
    const menuData = loadMenuFile(menuFilePath);
    console.log(`✅ Loaded menu file: ${menuData.metadata?.restaurant_name || 'Unknown'}`);
    console.log(`   Categories: ${menuData.categories?.length || 0}`);
    console.log(`   Products: ${menuData.products?.length || 0}\n`);

    // Ensure branch exists
    const finalBranchId = await ensureBranch(connection);
    console.log(`✅ Branch ID: ${finalBranchId}\n`);

    // Seed categories first (required for products)
    const categoryMap = await seedCategories(connection, menuData.categories || [], finalBranchId);

    // Seed products
    await seedProducts(connection, menuData.products || [], categoryMap, finalBranchId);

    console.log('\n✅ Menu seeding completed successfully!');
    console.log(`\n📝 Summary:`);
    console.log(`   Branch ID: ${finalBranchId}`);
    console.log(`   Categories: ${menuData.categories?.length || 0}`);
    console.log(`   Products: ${menuData.products?.length || 0}`);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run seeding
if (require.main === module) {
  seedMenu().catch(console.error);
}

module.exports = { seedMenu };

