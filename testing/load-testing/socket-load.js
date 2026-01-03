// K6 Load Test: WebSocket (Socket.io) Connection
// Tests WebSocket connections and message handling

import ws from 'k6/ws';
import { check } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('ws_errors');
const messageRate = new Rate('ws_messages_received');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 connections
    { duration: '1m', target: 10 },     // Stay at 10 connections
    { duration: '30s', target: 20 },    // Ramp up to 20 connections
    { duration: '1m', target: 20 },     // Stay at 20 connections
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    ws_errors: ['rate<0.01'],
    ws_messages_received: ['rate>0.8'], // At least 80% of messages should be received
  },
};

const WS_URL = __ENV.WS_URL || 'ws://localhost:5000';
const BRANCH_ID = __ENV.BRANCH_ID || 'branch-001';

export default function () {
  const url = `${WS_URL}/socket.io/?EIO=4&transport=websocket`;
  const room = `kitchen-${BRANCH_ID}`;

  const response = ws.connect(url, {}, function (socket) {
    socket.on('open', function () {
      // Join kitchen room
      socket.send(JSON.stringify({
        type: 'join_room',
        room: room,
      }));

      // Send test order event
      socket.send(JSON.stringify({
        type: 'test_order',
        data: {
          order_id: `test-order-${Date.now()}`,
          table_number: 'A01',
        },
      }));
    });

    socket.on('message', function (data) {
      const message = JSON.parse(data);
      
      const success = check(message, {
        'message received': () => true,
        'message has type': (msg) => msg.type !== undefined,
      });

      messageRate.add(success);
    });

    socket.on('error', function (e) {
      console.error('WebSocket error:', e);
      errorRate.add(1);
    });

    // Keep connection alive for 30 seconds
    socket.setTimeout(function () {
      socket.close();
    }, 30000);
  });

  const connectionSuccess = check(response, {
    'WebSocket connected': (r) => r && r.status === 101,
  });

  errorRate.add(!connectionSuccess);
});

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
  };
}

