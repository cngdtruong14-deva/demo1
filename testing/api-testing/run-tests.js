#!/usr/bin/env node
/**
 * API Test Runner
 * 
 * Usage:
 *   node run-tests.js
 *   node run-tests.js menu
 *   node run-tests.js auth
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');

// Simple test runner
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  async run(testFile) {
    console.log(`\n🧪 Running tests from: ${testFile}\n`);
    
    try {
      // Load test file
      const testModule = require(testFile);
      
      // Run tests (simplified - in production, use Jest or Mocha)
      if (typeof testModule === 'function') {
        await this.executeTest(testModule);
      }
    } catch (error) {
      console.error(`❌ Error running tests: ${error.message}`);
      this.results.failed++;
    }
  }

  async executeTest(testSuite) {
    // This is a simplified runner
    // In production, use Jest, Mocha, or similar
    console.log('⚠️  Note: Full test execution requires Jest or Mocha');
    console.log('   Install: npm install --save-dev jest');
    console.log('   Run: npm test\n');
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Summary');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📦 Total:  ${this.results.total}`);
    console.log('='.repeat(50) + '\n');
  }
}

// Main execution
async function main() {
  const testFilter = process.argv[2]; // e.g., 'menu', 'auth'
  const testDir = __dirname;
  
  const runner = new TestRunner();
  
  // Find test files
  const testFiles = fs.readdirSync(testDir)
    .filter(file => file.endsWith('.test.js'))
    .filter(file => !testFilter || file.includes(testFilter))
    .map(file => path.join(testDir, file));

  if (testFiles.length === 0) {
    console.log('❌ No test files found');
    process.exit(1);
  }

  console.log('🚀 QR Order Platform - API Test Runner\n');
  console.log(`📁 Test directory: ${testDir}`);
  console.log(`🔍 Found ${testFiles.length} test file(s)\n`);

  // Run tests
  for (const testFile of testFiles) {
    await runner.run(testFile);
  }

  runner.printSummary();

  // Exit with error code if tests failed
  if (runner.results.failed > 0) {
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
}

module.exports = { main };

