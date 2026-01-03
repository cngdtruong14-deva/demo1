/**
 * Socket.io Configuration
 * Real-time communication setup
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Initialize Socket.io server
 */
function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || [
        'http://localhost:3000',  // Next.js Customer
        'http://localhost:3001',  // React Admin (if on 3001)
        'http://localhost:5173',  // Vite Admin (default)
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  // Middleware for authentication (optional)
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      // Allow unauthenticated connections for public features
      socket.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      logger.warn('Socket authentication failed:', error.message);
      socket.user = null;
      next(); // Still allow connection but mark as unauthenticated
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`🔌 New socket connection: ${socket.id}`);

    // Store user info
    if (socket.user) {
      socket.data.userId = socket.user.id;
      socket.data.role = socket.user.role;
    }

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`❌ Socket disconnected: ${socket.id} - Reason: ${reason}`);
    });

    // Error handler
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  // Initialize socket handlers
  require('../sockets')(io);

  logger.info('✅ Socket.io initialized successfully');
  return io;
}

/**
 * Emit event to specific room
 */
function emitToRoom(io, room, event, data) {
  io.to(room).emit(event, data);
}

/**
 * Emit event to specific user
 */
function emitToUser(io, userId, event, data) {
  io.to(`user_${userId}`).emit(event, data);
}

/**
 * Broadcast to all connected clients
 */
function broadcastAll(io, event, data) {
  io.emit(event, data);
}

module.exports = {
  initializeSocket,
  emitToRoom,
  emitToUser,
  broadcastAll,
};

