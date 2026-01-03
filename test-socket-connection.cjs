#!/usr/bin/env node

/**
 * Socket.io Connection Test
 * Tests if socket can connect to backend
 */

const { io } = require('socket.io-client');

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:5000';

console.log('🧪 Testing Socket.io Connection...');
console.log(`📡 Connecting to: ${SOCKET_URL}`);
console.log('');

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
});

let connected = false;

socket.on('connect', () => {
  connected = true;
  console.log('✅ SUCCESS: Socket connected!');
  console.log(`   Socket ID: ${socket.id}`);
  console.log('');
  
  // Test joining kitchen room
  console.log('📍 Testing join_room...');
  socket.emit('join_room', { type: 'kitchen', id: '1' });
});

socket.on('room_joined', (data) => {
  console.log('✅ Room joined successfully!');
  console.log('   Room:', data.room);
  console.log('');
  console.log('🎉 All tests PASSED!');
  console.log('');
  console.log('✅ Socket connection is working correctly.');
  console.log('   Frontend should be able to connect now.');
  process.exit(0);
});

socket.on('connect_error', (error) => {
  console.error('❌ FAILED: Socket connection error');
  console.error('   Error:', error.message);
  console.error('');
  console.error('🔍 Troubleshooting:');
  console.error('   1. Check if backend is running: curl http://localhost:5000/health');
  console.error('   2. Check CORS settings in backend/src/config/socket.js');
  console.error('   3. Check if port 5000 is not blocked by firewall');
  console.error('   4. Check backend logs for connection attempts');
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  if (connected) {
    console.log('⚠️  Socket disconnected:', reason);
  }
});

// Timeout after 10 seconds
setTimeout(() => {
  if (!connected) {
    console.error('❌ FAILED: Connection timeout after 10 seconds');
    console.error('   Backend might not be running or not accessible');
    process.exit(1);
  }
}, 10000);

console.log('⏳ Waiting for connection...');
console.log('');

