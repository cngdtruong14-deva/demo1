#!/usr/bin/env node

/**
 * Database Migration Script
 * Runs database/init.sql to create all tables
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const logger = require('../src/utils/logger');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

const INIT_SQL_PATH = path.join(__dirname, '../../database/init.sql');

async function migrateDatabase() {
  let connection;

  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2ac852f9-c3bc-45fa-8d7e-92cf01ac2071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'migrate-db.js:24',message:'Function entry',data:{dbName:process.env.DB_NAME},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to MySQL');

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2ac852f9-c3bc-45fa-8d7e-92cf01ac2071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'migrate-db.js:30',message:'Connection established',data:{hasDatabase:!!DB_CONFIG.database},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Create database FIRST before executing SQL
    const dbName = process.env.DB_NAME || 'restaurant_db';
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2ac852f9-c3bc-45fa-8d7e-92cf01ac2071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'migrate-db.js:36',message:'Before database creation',data:{dbName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    console.log(`📦 Creating database '${dbName}' if not exists...`);
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2ac852f9-c3bc-45fa-8d7e-92cf01ac2071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'migrate-db.js:42',message:'Database created',data:{dbName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      await connection.query(`USE \`${dbName}\``);
      console.log(`✅ Database '${dbName}' selected`);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2ac852f9-c3bc-45fa-8d7e-92cf01ac2071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'migrate-db.js:47',message:'Database selected',data:{dbName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2ac852f9-c3bc-45fa-8d7e-92cf01ac2071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'migrate-db.js:51',message:'Database creation error',data:{error:error.message,code:error.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      console.log(`⚠️  Database '${dbName}' may already exist`);
      // Try to use it anyway
      await connection.query(`USE \`${dbName}\``);
    }

    // Read init.sql
    console.log('📖 Reading database/init.sql...');
    if (!fs.existsSync(INIT_SQL_PATH)) {
      throw new Error(`Database init file not found: ${INIT_SQL_PATH}`);
    }

    let sql = fs.readFileSync(INIT_SQL_PATH, 'utf8');
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2ac852f9-c3bc-45fa-8d7e-92cf01ac2071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'migrate-db.js:64',message:'Before SQL processing',data:{sqlLength:sql.length,hasDelimiter:sql.includes('DELIMITER'),dbName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Sanitize: Remove DELIMITER statements (not supported by mysql2 driver)
    // Remove all DELIMITER lines (DELIMITER $$, DELIMITER //, DELIMITER ;, etc.)
    sql = sql.replace(/^\s*DELIMITER\s+[^\r\n]*$/gim, '');
    
    // Replace custom delimiters ($$, //) with semicolons
    // This is needed because stored procedures and triggers use $$ instead of ;
    sql = sql.replace(/\$\$/g, ';');
    sql = sql.replace(/\/\//g, ';');
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2ac852f9-c3bc-45fa-8d7e-92cf01ac2071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'migrate-db.js:72',message:'After SQL processing',data:{sqlLength:sql.length,hasDelimiter:sql.includes('DELIMITER')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    console.log('📝 Executing SQL file as single statement...');

    // Execute entire SQL file as single query (multipleStatements: true enabled)
    // Do NOT split by semicolon - this preserves stored procedures with BEGIN...END blocks
    try {
      await connection.query(sql);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2ac852f9-c3bc-45fa-8d7e-92cf01ac2071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'migrate-db.js:98',message:'SQL execution error',data:{error:error.message,code:error.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      throw error;
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2ac852f9-c3bc-45fa-8d7e-92cf01ac2071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'migrate-db.js:71',message:'SQL executed successfully',data:{dbName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    console.log('✅ Database migration completed successfully!');

    // Verify tables were created
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n📊 Created ${tables.length} tables:`);
    tables.forEach((table) => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2ac852f9-c3bc-45fa-8d7e-92cf01ac2071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'migrate-db.js:82',message:'Migration completed',data:{tableCount:tables.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run seed script: npm run seed');
    console.log('   2. Start backend: npm run dev');

  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2ac852f9-c3bc-45fa-8d7e-92cf01ac2071',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'migrate-db.js:92',message:'Migration error',data:{error:error.message,code:error.code,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    console.error('❌ Migration failed:', error.message);
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

migrateDatabase();

