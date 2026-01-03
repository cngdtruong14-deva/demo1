import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// Use proxy in development, direct URL in production
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "http://localhost:5000");

console.log("🔧 Socket URL configured:", SOCKET_URL);
console.log("🔧 Environment:", import.meta.env.MODE);

interface UseSocketOptions {
  room?: string | { type: string; id: string };
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
      console.log("🔌 Socket disabled, skipping connection");
      return;
    }

    console.log(`🔌 Connecting to Socket.io server: ${SOCKET_URL}`);
    console.log(`   Room:`, room);

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      forceNew: false,
    });

    socketRef.current = socket;

    // Store socket instance globally for debugging
    (window as any).__socketInstance = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("✅ Socket connected!", socket.id);
      setIsConnected(true);
      setError(null);
      onConnect?.();

      // Join room if specified
      if (room) {
        if (typeof room === "string") {
          console.log(`📍 Joining room: ${room}`);
          socket.emit("join_room", room);
        } else {
          const roomData = {
            type: room.type || "kitchen",
            id: room.id,
          };
          console.log(`📍 Joining room:`, roomData);
          socket.emit("join_room", roomData);
        }
      }
    });

    socket.on("room_joined", (data: any) => {
      console.log("✅ Room joined:", data);
      console.log(`   Socket ${socket.id} is now in room: ${data.room}`);
    });

    socket.on("disconnect", (reason: string) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
      onDisconnect?.();
    });

    socket.on("connect_error", (err: Error) => {
      console.error("❌ Socket connection error:", err.message);
      setError(err);
      setIsConnected(false);
      onError?.(err);
    });

    socket.on("reconnect", (attemptNumber: number) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setError(null);

      // Rejoin room after reconnect
      if (room) {
        if (typeof room === "string") {
          socket.emit("join_room", room);
        } else {
          socket.emit("join_room", {
            type: room.type || "kitchen",
            id: room.id,
          });
        }
      }
    });

    socket.on("reconnect_attempt", (attemptNumber: number) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    socket.on("reconnect_error", (err: Error) => {
      console.error("❌ Reconnection error:", err.message);
    });

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket connection...");
      if (room && socketRef.current) {
        if (typeof room === "string") {
          socketRef.current.emit("leave_room", room);
        } else {
          socketRef.current.emit("leave_room", {
            type: room.type || "kitchen",
            id: room.id,
          });
        }
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
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
  const on = (event: string, callback: (...args: any[]) => void) => {
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
  const off = (event: string, callback?: (...args: any[]) => void) => {
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

// Export socket instance getter for debugging
export function getSocketInstance(): Socket | null {
  // This is a workaround - we can't access socketRef from outside
  // But we can use window for debugging
  return (window as any).__socketInstance || null;
}
