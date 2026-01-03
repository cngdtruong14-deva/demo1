#!/usr/bin/env node

/**
 * QR Code Generator Script
 * Generates QR codes for restaurant tables
 */

const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

// Configuration
const CONFIG = {
  outputDir: path.join(__dirname, '../public/qr-codes'),
  baseUrl: process.env.QR_BASE_URL || 'http://localhost:3000/customer/menu',
  branchId: process.env.BRANCH_ID || 'branch-001',
};

// Table data (can be loaded from database)
const tables = [
  { id: 'table-001', number: 'A01', branchId: 'branch-001' },
  { id: 'table-002', number: 'A02', branchId: 'branch-001' },
  { id: 'table-003', number: 'A03', branchId: 'branch-001' },
  { id: 'table-004', number: 'B01', branchId: 'branch-001' },
  { id: 'table-005', number: 'B02', branchId: 'branch-001' },
];

/**
 * Generate QR code for a table
 */
async function generateQRCode(table) {
  const url = `${CONFIG.baseUrl}?table_id=${table.id}&branch_id=${table.branchId}`;
  const filename = `table-${table.number}-${table.branchId}.png`;
  const filepath = path.join(CONFIG.outputDir, filename);

  try {
    // Ensure output directory exists
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Generate QR code
    await QRCode.toFile(filepath, url, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    console.log(`✅ Generated QR code for table ${table.number}: ${filepath}`);
    return { table, filepath, url };
  } catch (error) {
    console.error(`❌ Error generating QR for table ${table.number}:`, error.message);
    return null;
  }
}

/**
 * Generate QR codes for all tables
 */
async function generateAllQRCodes() {
  console.log('🚀 Starting QR code generation...');
  console.log(`📁 Output directory: ${CONFIG.outputDir}`);
  console.log(`🌐 Base URL: ${CONFIG.baseUrl}`);
  console.log('');

  const results = [];

  for (const table of tables) {
    const result = await generateQRCode(table);
    if (result) {
      results.push(result);
    }
  }

  console.log('');
  console.log(`✅ Generated ${results.length} QR codes`);
  console.log('');
  console.log('QR Code URLs:');
  results.forEach(({ table, url }) => {
    console.log(`  Table ${table.number}: ${url}`);
  });
}

// Run if executed directly
if (require.main === module) {
  generateAllQRCodes().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { generateQRCode, generateAllQRCodes };

