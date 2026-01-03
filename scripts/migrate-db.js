#!/usr/bin/env node

/**
 * Database Migration Script
 * Runs database migrations in order
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

const MIGRATIONS_DIR = path.join(__dirname, '../database/migrations');

/**
 * Get all migration files in order
 */
function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort alphabetically to ensure order

  return files.map(file => ({
    name: file,
    path: path.join(MIGRATIONS_DIR, file),
  }));
}

/**
 * Check if migration has been run
 */
async function isMigrationRun(connection, migrationName) {
  try {
    // Create migrations table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await connection.query(
      'SELECT * FROM migrations WHERE name = ?',
      [migrationName]
    );

    return rows.length > 0;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

/**
 * Mark migration as executed
 */
async function markMigrationRun(connection, migrationName) {
  await connection.query(
    'INSERT INTO migrations (name) VALUES (?)',
    [migrationName]
  );
}

/**
 * Run a single migration
 */
async function runMigration(connection, migration) {
  console.log(`📝 Running migration: ${migration.name}`);

  try {
    const sql = fs.readFileSync(migration.path, 'utf8');
    await connection.query(sql);
    await markMigrationRun(connection, migration.name);
    console.log(`✅ Migration ${migration.name} completed`);
    return true;
  } catch (error) {
    console.error(`❌ Error running migration ${migration.name}:`, error.message);
    return false;
  }
}

/**
 * Run all pending migrations
 */
async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  console.log('');

  let connection;
  try {
    // Connect to database
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to database');

    // Get all migration files
    const migrations = getMigrationFiles();
    console.log(`📋 Found ${migrations.length} migration files`);
    console.log('');

    let successCount = 0;
    let skipCount = 0;

    // Run each migration
    for (const migration of migrations) {
      const alreadyRun = await isMigrationRun(connection, migration.name);

      if (alreadyRun) {
        console.log(`⏭️  Skipping ${migration.name} (already executed)`);
        skipCount++;
      } else {
        const success = await runMigration(connection, migration);
        if (success) {
          successCount++;
        } else {
          console.error('❌ Migration failed. Stopping.');
          break;
        }
      }
    }

    console.log('');
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Executed: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   📝 Total: ${migrations.length}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
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
  runMigrations().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runMigrations };

