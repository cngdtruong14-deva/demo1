import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Card, Alert, Button, Space } from "antd";

/**
 * Socket Connection Test Page
 * Simple test page to verify socket.io connection
 */
export default function SocketTestPage() {
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomJoined, setRoomJoined] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
    console.log(message);
  };

  useEffect(() => {
    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    addLog(`🔌 Connecting to: ${SOCKET_URL}`);
    addLog(`🔧 Environment: ${import.meta.env.MODE}`);

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    socket.on("connect", () => {
      addLog(`✅ Connected! Socket ID: ${socket.id}`);
      setConnected(true);
      setSocketId(socket.id ?? null);
      setError(null);

      // Test joining kitchen room
      addLog("📍 Joining kitchen room...");
      socket.emit("join_room", { type: "kitchen", id: "1" });
    });

    socket.on("room_joined", (data: any) => {
      addLog(`✅ Room joined: ${data.room}`);
      setRoomJoined(true);
    });

    socket.on("connect_error", (err: Error) => {
      addLog(`❌ Connection error: ${err.message}`);
      setError(err.message);
      setConnected(false);
    });

    socket.on("disconnect", (reason: string) => {
      addLog(`❌ Disconnected: ${reason}`);
      setConnected(false);
      setRoomJoined(false);
    });

    socket.on("reconnect", (attemptNumber: number) => {
      addLog(`🔄 Reconnected after ${attemptNumber} attempts`);
      setConnected(true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Card title="🔌 Socket.io Connection Test">
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Alert
            message={connected ? "✅ Connected to Server" : "⚠️ Disconnected"}
            description={
              connected
                ? `Socket ID: ${socketId} | Room: ${
                    roomJoined ? "kitchen-1 ✅" : "Not joined"
                  }`
                : error || "Waiting for connection..."
            }
            type={connected ? "success" : "warning"}
            showIcon
          />

          <div>
            <h3>Connection Logs:</h3>
            <div
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
                maxHeight: "300px",
                overflowY: "auto",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
            >
              {logs.length === 0 ? (
                <div style={{ color: "#999" }}>No logs yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} style={{ marginBottom: "4px" }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3>Environment Info:</h3>
            <ul>
              <li>
                Socket URL:{" "}
                {import.meta.env.VITE_SOCKET_URL ||
                  "http://localhost:5000 (default)"}
              </li>
              <li>Mode: {import.meta.env.MODE}</li>
              <li>Dev: {import.meta.env.DEV ? "Yes" : "No"}</li>
            </ul>
          </div>

          <Button
            type="primary"
            onClick={() => window.location.reload()}
            disabled={connected}
          >
            Retry Connection
          </Button>
        </Space>
      </Card>
    </div>
  );
}
