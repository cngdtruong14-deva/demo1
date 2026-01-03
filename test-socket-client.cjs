#!/usr/bin/env node

/**
 * Socket.io Client Test - Listen for new_order events
 * Tests if backend emits socket events correctly
 */

const { io } = require('socket.io-client');

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
});

console.log('🔌 Connecting to Socket.io server...');
console.log('');

socket.on('connect', () => {
  console.log('✅ Connected to server!');
  console.log(`   Socket ID: ${socket.id}`);
  console.log('');
  
  // Join kitchen room (like admin KDS does)
  const branchId = '1';
  socket.emit('join_room', { type: 'kitchen', id: branchId });
  console.log(`📍 Joining kitchen room: kitchen-${branchId}`);
  console.log('');
  console.log('👂 Listening for new_order events...');
  console.log('   (Place an order from customer app to see events)');
  console.log('');
});

socket.on('room_joined', (data) => {
  console.log(`✅ Joined room: ${data.room}`);
  console.log('');
});

socket.on('new_order', (orderData) => {
  console.log('🔥 NEW ORDER RECEIVED!');
  console.log('='.repeat(60));
  console.log('Order Number:', orderData.orderNumber);
  console.log('Table:', orderData.tableNumber);
  console.log('Total:', orderData.total.toLocaleString('vi-VN') + 'đ');
  console.log('Items:', orderData.items.length);
  console.log('');
  console.log('Items:');
  orderData.items.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.productName} x${item.quantity} - ${item.price.toLocaleString('vi-VN')}đ`);
  });
  console.log('='.repeat(60));
  console.log('');
  console.log('✅ Socket event test PASSED!');
  console.log('   Admin KDS should receive this order in real-time.');
  console.log('');
});

socket.on('kitchen:new_order', (orderData) => {
  console.log('🔥 KITCHEN:NEW_ORDER RECEIVED!');
  console.log('   (Same order, different event name)');
  console.log('');
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.error('   Make sure backend is running on port 5000');
});

// Keep script running
console.log('⏳ Waiting for orders... (Press Ctrl+C to exit)');
console.log('');

