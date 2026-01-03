/**
 * Socket.io Hook for Real-time Communication
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

interface UseSocketOptions {
  room?: string;
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { room, enabled = true, onConnect, onDisconnect, onError } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
        if (typeof room === 'string') {
          // Parse legacy format: "order_123" -> { type: 'order', id: '123' }
          const parts = room.split('_');
          if (parts.length === 2) {
            socket.emit('join_room', { type: parts[0], id: parts[1] });
          } else {
            console.warn('Invalid room format:', room);
          }
        } else {
          socket.emit('join_room', room);
        }
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      onDisconnect?.();
    });

    socket.on('connect_error', (err: Error) => {
      setError(err);
      setIsConnected(false);
      onError?.(err);
    });

    // Cleanup on unmount
    return () => {
      if (room) {
        if (typeof room === 'string') {
          const parts = room.split('_');
          if (parts.length === 2) {
            socket.emit('leave_room', { type: parts[0], id: parts[1] });
          }
        } else {
          socket.emit('leave_room', room);
        }
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, room, onConnect, onDisconnect, onError]);

  // Emit event helper
  const emit = (event: string, data?: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  // Listen to event helper
  const on = (event: string, callback: (data: any) => void) => {
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
  const off = (event: string, callback?: (data: any) => void) => {
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

