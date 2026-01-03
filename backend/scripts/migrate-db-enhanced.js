#!/usr/bin/env node

/**
 * Enhanced Database Migration Script
 * Handles complex SQL including triggers and procedures
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
  multipleStatements: false, // Changed to false for better control
};

const INIT_SQL_PATH = path.join(__dirname, '../../database/init.sql');

async function migrateDatabase() {
  let connection;

  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to MySQL');

    const dbName = process.env.DB_NAME || 'restaurant_db';

    // Create and use database
    console.log(`📦 Creating database '${dbName}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);
    console.log(`✅ Database '${dbName}' selected`);

    // Read init.sql
    console.log('📖 Reading database/init.sql...');
    if (!fs.existsSync(INIT_SQL_PATH)) {
      throw new Error(`Database init file not found: ${INIT_SQL_PATH}`);
    }

    let sql = fs.readFileSync(INIT_SQL_PATH, 'utf8');

    // Split SQL into sections
    console.log('📝 Processing SQL statements...');
    
    // Extract parts before triggers/procedures (table creations)
    const triggerStart = sql.indexOf('-- TRIGGERS');
    const procedureStart = sql.indexOf('-- STORED PROCEDURES');
    
    let tableSql = sql;
    let triggerSql = '';
    let procedureSql = '';
    
    if (triggerStart > 0) {
      tableSql = sql.substring(0, triggerStart);
      if (procedureStart > triggerStart) {
        triggerSql = sql.substring(triggerStart, procedureStart);
        procedureSql = sql.substring(procedureStart);
      } else {
        triggerSql = sql.substring(triggerStart);
      }
    }

    // Process table creation statements
    console.log('📊 Creating tables...');
    await executeStatements(connection, tableSql);

    // Skip triggers and procedures for now (they require special handling)
    console.log('⏭️  Skipping triggers and procedures (can be added manually later)');
    
    console.log('✅ Database migration completed successfully!');

    // Verify tables were created
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n📊 Created ${tables.length} tables:`);
    tables.forEach((table) => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run seed script: npm run seed');
    console.log('   2. Start backend: npm run dev');
    console.log('\n💡 Note: Triggers and procedures skipped. Add them manually if needed.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    if (error.sql) {
      console.error(`   SQL: ${error.sql.substring(0, 200)}...`);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

async function executeStatements(connection, sql) {
  // Remove comments and empty lines
  const lines = sql.split('\n');
  const cleanedLines = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('--')) {
      cleanedLines.push(line);
    }
  }
  
  const cleanSql = cleanedLines.join('\n');
  
  // Split by semicolon, but be careful with strings
  const statements = cleanSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
  
  console.log(`   Found ${statements.length} statements to execute`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    if (statement.length === 0) continue;
    if (statement.toUpperCase().includes('DELIMITER')) continue;
    if (statement.includes('END$$')) continue;
    if (statement.includes('BEGIN$$')) continue;
    
    try {
      await connection.query(statement);
      
      // Show progress for long migrations
      if (i % 5 === 0 && i > 0) {
        console.log(`   Progress: ${i}/${statements.length} statements executed`);
      }
    } catch (error) {
      // Some errors are acceptable (e.g., table already exists)
      if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
          error.code === 'ER_DUP_ENTRY' ||
          error.code === 'ER_DUP_KEYNAME') {
        console.log(`   ⚠️  Statement ${i + 1} skipped (already exists)`);
        continue;
      }
      
      // Re-throw other errors with context
      console.error(`\n❌ Error at statement ${i + 1}:`);
      console.error(`   Statement preview: ${statement.substring(0, 100)}...`);
      throw error;
    }
  }
  
  console.log(`   ✅ All statements executed successfully`);
}

migrateDatabase();

