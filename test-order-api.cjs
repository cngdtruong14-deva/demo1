#!/usr/bin/env node

/**
 * Test script for real-time order notification
 * Tests POST /orders endpoint and socket emission
 */

const http = require('http');

const orderData = JSON.stringify({
  tableId: 'demo-table-1',
  branchId: '1',
  items: [
    {
      productId: 'prod-001',
      quantity: 2
    },
    {
      productId: 'prod-003',
      quantity: 1
    }
  ],
  notes: 'Test order from Node.js script'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(orderData)
  }
};

console.log('🧪 Testing POST /api/v1/orders...');
console.log('📦 Order data:', orderData);
console.log('');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ Response Status:', res.statusCode);
    console.log('📄 Response Body:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (json.success && json.data) {
        console.log('');
        console.log('🎉 Order created successfully!');
        console.log(`   Order ID: ${json.data.orderId}`);
        console.log(`   Order Number: ${json.data.orderNumber}`);
        console.log(`   Total: ${json.data.total.toLocaleString('vi-VN')}đ`);
        console.log('');
        console.log('📡 Check backend console for socket emission logs:');
        console.log('   Should see: 🔥 New Order emitted: ...');
        console.log('');
        console.log('✅ Test completed! If admin KDS is open, it should receive the order.');
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.error('   Make sure backend is running on port 5000');
});

req.write(orderData);
req.end();

