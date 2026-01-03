/**
 * Socket.io Hook for Real-time Communication
 */

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket(options = {}) {
  const { room, enabled = true, onConnect, onDisconnect, onError } = options;
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      onConnect?.();

      // Join room if specified
      if (room) {
        socket.emit('join_room', {
          type: room.type || 'kitchen',
          id: room.id,
        });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      onDisconnect?.();
    });

    socket.on('connect_error', (err) => {
      setError(err);
      setIsConnected(false);
      onError?.(err);
    });

    // Cleanup on unmount
    return () => {
      if (room) {
        socket.emit('leave_room', {
          type: room.type || 'kitchen',
          id: room.id,
        });
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, room, onConnect, onDisconnect, onError]);

  // Emit event helper
  const emit = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  // Listen to event helper
  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }

    // Return cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  };

  // Remove listener helper
  const off = (event, callback) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    error,
    emit,
    on,
    off,
  };
}

