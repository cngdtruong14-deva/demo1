#!/usr/bin/env node

/**
 * Database Seeding Script
 * Seeds the database with sample data
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'restaurant_db',
  multipleStatements: true,
};

const SEED_FILE = path.join(__dirname, '../database/seed.sql');

/**
 * Check if database is already seeded
 */
async function isSeeded(connection) {
  try {
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM branches');
    return rows[0].count > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Run seed script
 */
async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  console.log('');

  let connection;
  try {
    // Connect to database
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to database');

    // Check if already seeded
    const alreadySeeded = await isSeeded(connection);
    if (alreadySeeded) {
      console.log('⚠️  Database appears to be already seeded.');
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise((resolve) => {
        readline.question('Do you want to re-seed? This will delete existing data. (yes/no): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Seeding cancelled');
        return;
      }

      // Clear existing data
      console.log('🗑️  Clearing existing data...');
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      await connection.query('TRUNCATE TABLE order_items');
      await connection.query('TRUNCATE TABLE orders');
      await connection.query('TRUNCATE TABLE menu_items');
      await connection.query('TRUNCATE TABLE categories');
      await connection.query('TRUNCATE TABLE tables');
      await connection.query('TRUNCATE TABLE customers');
      await connection.query('TRUNCATE TABLE branches');
      await connection.query('TRUNCATE TABLE users');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('✅ Existing data cleared');
    }

    // Read and execute seed file
    console.log('📝 Reading seed file...');
    const seedSQL = fs.readFileSync(SEED_FILE, 'utf8');

    console.log('🌱 Executing seed data...');
    await connection.query(seedSQL);

    console.log('');
    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('📊 Seeded data:');
    const [branches] = await connection.query('SELECT COUNT(*) as count FROM branches');
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [tables] = await connection.query('SELECT COUNT(*) as count FROM tables');
    const [menuItems] = await connection.query('SELECT COUNT(*) as count FROM menu_items');
    const [orders] = await connection.query('SELECT COUNT(*) as count FROM orders');

    console.log(`   🏢 Branches: ${branches[0].count}`);
    console.log(`   👤 Users: ${users[0].count}`);
    console.log(`   🪑 Tables: ${tables[0].count}`);
    console.log(`   🍽️  Menu Items: ${menuItems[0].count}`);
    console.log(`   📋 Orders: ${orders[0].count}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run if executed directly
if (require.main === module) {
  seedDatabase().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { seedDatabase };

