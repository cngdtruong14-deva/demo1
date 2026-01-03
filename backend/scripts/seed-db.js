#!/usr/bin/env node

/**
 * Database Seeding Script
 * Seeds database with sample data from database/seed.sql
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'restaurant_db',
  multipleStatements: true,
};

const SEED_SQL_PATH = path.join(__dirname, '../../database/seed.sql');

async function seedDatabase() {
  let connection;

  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to MySQL');

    // Check if database exists
    const dbName = process.env.DB_NAME || 'restaurant_db';
    try {
      await connection.query(`USE \`${dbName}\``);
    } catch (error) {
      console.error(`❌ Database '${dbName}' does not exist. Please run migration first: npm run migrate`);
      process.exit(1);
    }

    // Check if data already exists
    const [existing] = await connection.query('SELECT COUNT(*) as count FROM branches');
    if (existing[0].count > 0) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise((resolve) => {
        rl.question('⚠️  Database already has data. Continue seeding? (y/N): ', resolve);
      });
      rl.close();

      if (answer.toLowerCase() !== 'y') {
        console.log('❌ Seeding cancelled.');
        process.exit(0);
      }

      // Clear existing data
      console.log('🗑️  Clearing existing data...');
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      await connection.query('TRUNCATE TABLE order_items');
      await connection.query('TRUNCATE TABLE orders');
      await connection.query('TRUNCATE TABLE products');
      await connection.query('TRUNCATE TABLE categories');
      await connection.query('TRUNCATE TABLE tables');
      await connection.query('TRUNCATE TABLE customers');
      await connection.query('TRUNCATE TABLE branches');
      await connection.query('TRUNCATE TABLE users');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('✅ Existing data cleared');
    }

    // Read seed.sql
    console.log('📖 Reading database/seed.sql...');
    if (!fs.existsSync(SEED_SQL_PATH)) {
      throw new Error(`Seed file not found: ${SEED_SQL_PATH}`);
    }

    const sql = fs.readFileSync(SEED_SQL_PATH, 'utf8');
    console.log('🌱 Seeding database...');

    // Execute SQL
    await connection.query(sql);
    console.log('✅ Database seeded successfully!');

    // Show summary
    const [branches] = await connection.query('SELECT COUNT(*) as count FROM branches');
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [tables] = await connection.query('SELECT COUNT(*) as count FROM tables');
    const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
    const [orders] = await connection.query('SELECT COUNT(*) as count FROM orders');

    console.log('\n📊 Seeded data summary:');
    console.log(`   🏢 Branches: ${branches[0].count}`);
    console.log(`   👤 Users: ${users[0].count}`);
    console.log(`   🪑 Tables: ${tables[0].count}`);
    console.log(`   🍽️  Products: ${products[0].count}`);
    console.log(`   📋 Orders: ${orders[0].count}`);

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start backend: npm run dev');
    console.log('   2. Test API endpoints');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

seedDatabase();

