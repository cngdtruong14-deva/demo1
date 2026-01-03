#!/usr/bin/env node

/**
 * Quick Mock Server - No Database Required
 * For testing frontend without MySQL/Redis
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

console.log('🚀 Starting Quick Mock Server...');
console.log('📦 No database required - using inline mock data');

// Mock menu data
const getMockMenu = branchId => {
  return {
    branch: {
      id: branchId,
      name: 'Nhà Hàng Mock Server',
      address: '123 Đường Mock, Quận 1, TP.HCM',
      phone: '0123456789'
    },
    categories: [
      {
        id: 'cat-001',
        name: 'Khai Vị',
        icon: '🥗',
        display_order: 1,
        status: 'active',
        product_count: 2,
        products: [
          {
            id: 'prod-001',
            category_id: 'cat-001',
            name: 'Gỏi Cuốn Tôm Thịt',
            description: 'Bánh tráng cuốn tôm thịt tươi',
            price: 45000,
            is_spicy: false,
            is_vegetarian: false,
            tags: ['best-seller'],
            status: 'available',
            sold_count: 100,
            rating: 4.5
          },
          {
            id: 'prod-002',
            category_id: 'cat-001',
            name: 'Chả Giò Rế',
            description: 'Chả giò chiên giòn',
            price: 55000,
            is_spicy: false,
            is_vegetarian: false,
            tags: [],
            status: 'available',
            sold_count: 80,
            rating: 4.3
          }
        ]
      },
      {
        id: 'cat-002',
        name: 'Món Chính',
        icon: '🍜',
        display_order: 2,
        status: 'active',
        product_count: 3,
        products: [
          {
            id: 'prod-003',
            category_id: 'cat-002',
            name: 'Phở Bò Tái',
            description: 'Phở bò truyền thống',
            price: 65000,
            is_spicy: false,
            is_vegetarian: false,
            tags: ['best-seller', 'signature'],
            status: 'available',
            sold_count: 200,
            rating: 4.8
          },
          {
            id: 'prod-004',
            category_id: 'cat-002',
            name: 'Bún Chả Hà Nội',
            description: 'Bún chả với chả nướng',
            price: 60000,
            is_spicy: false,
            is_vegetarian: false,
            tags: ['signature'],
            status: 'available',
            sold_count: 150,
            rating: 4.6
          },
          {
            id: 'prod-005',
            category_id: 'cat-002',
            name: 'Cơm Tấm Sườn Bì',
            description: 'Cơm tấm với sườn nướng',
            price: 55000,
            is_spicy: false,
            is_vegetarian: false,
            tags: [],
            status: 'available',
            sold_count: 120,
            rating: 4.4
          }
        ]
      },
      {
        id: 'cat-003',
        name: 'Đồ Uống',
        icon: '🥤',
        display_order: 3,
        status: 'active',
        product_count: 3,
        products: [
          {
            id: 'prod-006',
            category_id: 'cat-003',
            name: 'Trà Đá',
            description: 'Trà đá miễn phí',
            price: 0,
            is_spicy: false,
            is_vegetarian: true,
            tags: [],
            status: 'available',
            sold_count: 500,
            rating: 4.0
          },
          {
            id: 'prod-007',
            category_id: 'cat-003',
            name: 'Nước Cam Vắt',
            description: 'Nước cam tươi 100%',
            price: 25000,
            is_spicy: false,
            is_vegetarian: true,
            tags: ['fresh'],
            status: 'available',
            sold_count: 180,
            rating: 4.7
          },
          {
            id: 'prod-008',
            category_id: 'cat-003',
            name: 'Cà Phê Sữa Đá',
            description: 'Cà phê phin truyền thống',
            price: 20000,
            is_spicy: false,
            is_vegetarian: true,
            tags: [],
            status: 'available',
            sold_count: 250,
            rating: 4.6
          }
        ]
      }
    ],
    metadata: {
      total_categories: 3,
      total_products: 8,
      generated_at: new Date().toISOString()
    }
  };
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: 'mock', timestamp: new Date().toISOString() });
});

// Menu endpoint
app.get('/api/v1/menu/:branchId', (req, res) => {
  const { branchId } = req.params;
  console.log(`📥 Menu request for branch: ${branchId}`);

  const menu = getMockMenu(branchId);
  res.json({ success: true, data: menu });
});

// Mock products API
app.get('/api/v1/products', (req, res) => {
  const menu = getMockMenu('demo-branch-1');
  const allProducts = menu.categories.flatMap(cat => cat.products);

  res.json({
    success: true,
    data: allProducts,
    pagination: {
      page: 1,
      limit: 20,
      total: allProducts.length
    }
  });
});

// Mock categories API
app.get('/api/v1/categories', (req, res) => {
  const menu = getMockMenu('demo-branch-1');
  const categories = menu.categories.map(c => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    display_order: c.display_order
  }));
  res.json({ success: true, data: categories });
});

// Create product (emit socket event)
app.post('/api/v1/products', (req, res) => {
  const newProduct = {
    id: 'prod-' + Date.now(),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('📡 Emitting menu_updated event (create)');
  io.emit('menu_updated', {
    action: 'create',
    product: newProduct,
    branchId: req.body.branch_id || 'demo-branch-1',
    timestamp: new Date().toISOString()
  });

  res.status(201).json({ success: true, data: newProduct });
});

// Update product (emit socket event)
app.put('/api/v1/products/:id', (req, res) => {
  const updatedProduct = {
    id: req.params.id,
    ...req.body,
    updated_at: new Date().toISOString()
  };

  console.log('📡 Emitting menu_updated event (update)');
  io.emit('menu_updated', {
    action: 'update',
    product: updatedProduct,
    branchId: req.body.branch_id || 'demo-branch-1',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, data: updatedProduct });
});

// Delete product (emit socket event)
app.delete('/api/v1/products/:id', (req, res) => {
  console.log('📡 Emitting menu_updated event (delete)');
  io.emit('menu_updated', {
    action: 'delete',
    productId: req.params.id,
    branchId: 'demo-branch-1',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Product deleted' });
});

// Create order endpoint (with socket emission)
app.post('/api/v1/orders', (req, res) => {
  const { tableId, table_id, branchId, branch_id, items, notes } = req.body;

  const effectiveTableId = tableId || table_id || 'demo-table-1';
  const effectiveBranchId = branchId || branch_id || '1';

  // Generate order number
  const orderNumber = `ORD-${Date.now()}`;
  const orderId = `order-${Date.now()}`;

  // Calculate total (mock calculation)
  let total = 0;
  const orderItems = (items || []).map((item, index) => {
    // Mock product prices
    const mockPrices = {
      'prod-001': 45000,
      'prod-002': 55000,
      'prod-003': 65000,
      'prod-004': 60000,
      'prod-005': 55000
    };
    const price = mockPrices[item.productId] || item.productId || 50000;
    const quantity = item.quantity || 1;
    const subtotal = price * quantity;
    total += subtotal;

    return {
      id: `item-${index}`,
      productId: item.productId,
      product_id: item.productId,
      productName: `Product ${item.productId}`,
      product_name: `Product ${item.productId}`,
      name: `Product ${item.productId}`,
      quantity,
      price,
      unit_price: price,
      subtotal,
      status: 'pending',
      notes: item.notes,
      special_notes: item.notes
    };
  });

  const tax = total * 0.1;
  const finalTotal = total + tax;

  const orderData = {
    id: orderId,
    orderId,
    order_number: orderNumber,
    orderNumber,
    table_id: effectiveTableId,
    tableId: effectiveTableId,
    table_number: effectiveTableId.replace('demo-table-', 'Bàn '),
    tableNumber: effectiveTableId.replace('demo-table-', 'Bàn '),
    branch_id: effectiveBranchId,
    branchId: effectiveBranchId,
    total: finalTotal,
    total_amount: finalTotal,
    subtotal: total,
    tax,
    discount: 0,
    items: orderItems,
    orderItems,
    status: 'confirmed',
    order_status: 'confirmed',
    payment_status: 'pending',
    notes: notes || null,
    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  // 🔥 Emit socket events (same as real backend)
  console.log(`🔥 New Order emitted: ${orderNumber} (ID: ${orderId})`);
  console.log(
    `   Table: ${orderData.tableNumber}, Total: ${finalTotal.toLocaleString('vi-VN')}đ, Items: ${orderItems.length}`
  );
  console.log(`   Emitting to rooms: branch_${effectiveBranchId}, kitchen-${effectiveBranchId}`);

  // Get sockets in kitchen room for debugging
  const kitchenRoom = io.sockets.adapter.rooms.get(`kitchen-${effectiveBranchId}`);
  if (kitchenRoom) {
    console.log(`   ✅ Found ${kitchenRoom.size} socket(s) in kitchen-${effectiveBranchId} room`);
    kitchenRoom.forEach(socketId => {
      console.log(`     - Socket: ${socketId}`);
    });
  } else {
    console.log(`   ⚠️  WARNING: No sockets in kitchen-${effectiveBranchId} room!`);
    console.log('   💡 Make sure Kitchen Display page is open and connected');
  }

  // Emit to branch room
  io.to(`branch_${effectiveBranchId}`).emit('new_order', orderData);
  console.log(`   ✅ Emitted 'new_order' to branch_${effectiveBranchId}`);

  // Emit to kitchen room (for KDS) - PRIMARY TARGET
  const kitchenRoomName = `kitchen-${effectiveBranchId}`;
  io.to(kitchenRoomName).emit('new_order', orderData);
  io.to(kitchenRoomName).emit('kitchen:new_order', orderData);
  console.log(`   ✅ Emitted 'new_order' and 'kitchen:new_order' to ${kitchenRoomName}`);

  // Also broadcast to ALL sockets for debugging (temporary - helps diagnose room issues)
  console.log("   📢 Broadcasting 'new_order' to ALL sockets (debug mode)");
  io.emit('new_order', { ...orderData, _debug: 'broadcast_to_all' });

  // Return response
  res.status(201).json({
    success: true,
    data: {
      id: orderId,
      orderId,
      orderNumber,
      order_number: orderNumber,
      status: 'confirmed',
      total: finalTotal,
      items: orderItems
    },
    message: 'Order created successfully'
  });
});

// Socket.IO
io.on('connection', socket => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join_room', data => {
    let roomName;
    if (typeof data === 'string') {
      roomName = data;
    } else if (data && data.type && data.id) {
      // Handle kitchen, branch, table, order room types
      switch (data.type) {
        case 'kitchen':
          roomName = `kitchen-${data.id}`;
          break;
        case 'branch':
          roomName = `branch_${data.id}`;
          break;
        case 'table':
          roomName = `table:${data.id}`;
          break;
        case 'order':
          roomName = `order:${data.id}`;
          break;
        default:
          roomName = `${data.type}-${data.id}`;
      }
    } else {
      console.warn('Invalid join_room data:', data);
      return;
    }

    socket.join(roomName);
    console.log(`📍 Client ${socket.id} joined room: ${roomName}`);
    socket.emit('room_joined', { room: roomName, message: 'Successfully joined room' });
  });

  socket.on('leave_room', data => {
    let roomName;
    if (typeof data === 'string') {
      roomName = data;
    } else if (data && data.type && data.id) {
      switch (data.type) {
        case 'kitchen':
          roomName = `kitchen-${data.id}`;
          break;
        case 'branch':
          roomName = `branch_${data.id}`;
          break;
        default:
          roomName = `${data.type}-${data.id}`;
      }
    }
    if (roomName) {
      socket.leave(roomName);
      console.log(`📍 Client ${socket.id} left room: ${roomName}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('✅ Quick Mock Server Running!');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🍽️  Menu: http://localhost:${PORT}/api/v1/menu/demo-branch-1`);
  console.log(`📦 Orders: POST http://localhost:${PORT}/api/v1/orders`);
  console.log('🔌 Socket.IO ready');
  console.log('💡 Mode: MOCK (no database required)');
  console.log('='.repeat(60));
});
