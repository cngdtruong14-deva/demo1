import { useState, useEffect, useRef } from "react";
import {
  Card,
  Button,
  Badge,
  Tag,
  Select,
  Alert,
  Spin,
  Row,
  Col,
  message,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  FireOutlined,
  PlayCircleOutlined,
  StopOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setOrders,
  addOrder,
  updateOrder,
  updateOrderItemStatus,
  removeOrder,
  setLoading,
} from "@/store/slices/orderSlice";
import { useSocket } from "@/hooks/useSocket";
import {
  getKitchenOrders,
  updateOrderItemStatus as updateItemStatusAPI,
  getBranches,
} from "@/services/api";
import type { Order, OrderItem } from "@/store/slices/orderSlice";

dayjs.extend(relativeTime);

const { Option } = Select;

const STATUS_COLORS = {
  pending: "default",
  confirmed: "processing",
  preparing: "warning",
  ready: "success",
  served: "purple",
  completed: "success",
  cancelled: "error",
};

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chế biến",
  ready: "Sẵn sàng",
  served: "Đã phục vụ",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const ITEM_STATUS_COLORS = {
  pending: "default",
  cooking: "processing",
  ready: "success",
  served: "default",
};

const ITEM_STATUS_LABELS = {
  pending: "Chờ",
  cooking: "Đang nấu",
  ready: "Xong",
  served: "Đã phục vụ",
};

// Calculate elapsed time and get color
const getElapsedTimeInfo = (createdAt: string) => {
  const now = dayjs();
  const created = dayjs(createdAt);
  const minutes = now.diff(created, "minute");

  let color = "#10b981"; // Green - < 5 min
  if (minutes >= 30) {
    color = "#ef4444"; // Red - > 30 min
  } else if (minutes >= 15) {
    color = "#fbbf24"; // Yellow - 15-30 min
  } else if (minutes >= 5) {
    color = "#f97316"; // Orange - 5-15 min
  }

  return {
    minutes,
    display: `${minutes} phút`,
    color,
  };
};

export default function KitchenDisplay() {
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state) => state.orders);
  // Default to first branch ID from database (branch-001)
  const [branchId, setBranchId] = useState("branch-001");
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const [itemProcessing, setItemProcessing] = useState<Record<string, boolean>>(
    {}
  );
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/sounds/ding.mp3");
    audioRef.current.preload = "auto";
    audioRef.current.volume = 0.7;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    if (!soundEnabled || !audioRef.current) {
      return;
    }

    try {
      const audio = audioRef.current;
      audio.currentTime = 0;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("🔊 Notification sound played successfully");
          })
          .catch((error) => {
            console.warn(
              "⚠️  Could not play notification sound:",
              error.message
            );
            console.warn(
              '   User interaction may be required. Click "Test Sound" button.'
            );
          });
      }
    } catch (error: any) {
      console.error("❌ Error playing notification sound:", error.message);
    }
  };

  // Show toast notification
  const showNewOrderNotification = (
    orderNumber: string,
    tableNumber: string
  ) => {
    message.success({
      content: `🔔 Đơn hàng mới từ Bàn ${tableNumber} - ${orderNumber}`,
      duration: 5,
      style: {
        marginTop: "20px",
        fontSize: "16px",
      },
    });
  };

  // Test sound function
  const testSound = () => {
    if (!audioRef.current) {
      message.error("Audio not initialized");
      return;
    }

    try {
      const audio = audioRef.current;
      audio.currentTime = 0;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setSoundEnabled(true);
            message.success(
              "🔊 Sound enabled! You will hear notifications for new orders."
            );
            console.log("✅ Sound test successful - notifications enabled");
          })
          .catch((error) => {
            message.error(`Cannot play sound: ${error.message}`);
            console.error("❌ Sound test failed:", error);
          });
      }
    } catch (error: any) {
      message.error(`Error: ${error.message}`);
      console.error("❌ Sound test error:", error);
    }
  };

  // Socket connection
  const { socket, isConnected, error, on, off } = useSocket({
    room: { type: "kitchen", id: branchId },
    enabled: !!branchId,
    onConnect: () => {
      console.log("✅ Socket connected in KitchenDisplay");
    },
    onDisconnect: () => {
      console.log("❌ Socket disconnected in KitchenDisplay");
    },
    onError: (err) => {
      console.error("❌ Socket error in KitchenDisplay:", err);
    },
  });

  // Debug: Log connection state changes
  useEffect(() => {
    console.log("🔌 Socket state changed:", {
      isConnected,
      socketId: socket?.id,
      branchId,
      error: error?.message,
    });
  }, [isConnected, socket?.id, branchId, error]);

  // Load branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data = await getBranches();
        setBranches(data.data || data || []);
        // Set first branch as default if available
        if (data.data && data.data.length > 0 && !branchId) {
          setBranchId(data.data[0].id);
        }
      } catch (error) {
        console.error("Failed to load branches:", error);
      }
    };
    loadBranches();
  }, []);

  // Fetch initial orders
  useEffect(() => {
    loadOrders();
  }, [branchId]);

  const loadOrders = async () => {
    try {
      dispatch(setLoading(true));
      const data = await getKitchenOrders(branchId, "preparing");
      // Transform API data to match our Order interface
      const transformedOrders: Order[] = data.map((order: any) => ({
        id: order.id || order.orderId,
        orderNumber: order.orderNumber || order.order_id,
        tableNumber: order.tableNumber || order.table_number || "N/A",
        tableId: order.tableId || order.table_id,
        status: order.status || "preparing",
        total: order.total || order.total_amount || 0,
        createdAt:
          order.createdAt || order.created_at || new Date().toISOString(),
        items: (order.items || order.orderItems || []).map((item: any) => ({
          id: item.id || item.itemId,
          productId: item.productId || item.product_id,
          productName:
            item.productName || item.product_name || item.name || "Unknown",
          quantity: item.quantity || 1,
          price: item.price || item.unit_price || 0,
          status: item.status || "pending",
          notes: item.notes || item.special_notes,
        })),
        branchId: order.branchId || order.branch_id,
        customerId: order.customerId || order.customer_id,
        notes: order.notes || order.special_notes,
      }));
      dispatch(setOrders(transformedOrders));
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Listen for socket events
  useEffect(() => {
    if (!isConnected) {
      console.log("⏳ Waiting for socket connection...", {
        isConnected,
        socket: !!socket,
      });
      return;
    }

    if (!socket) {
      console.error("❌ Socket is null even though isConnected is true!");
      return;
    }

    console.log("🎧 Setting up socket event listeners...", {
      socketId: socket.id,
      branchId,
      isConnected,
    });

    const handleNewOrder = (orderData: any) => {
      // Skip debug broadcasts
      if (orderData._debug === "broadcast_to_all") {
        console.log("📢 Received broadcast order (debug mode):", orderData);
        return;
      }

      console.log("🔥 New order received via socket:", orderData);

      const newOrder: Order = {
        id: orderData.id || orderData.orderId,
        orderNumber: orderData.orderNumber || orderData.order_number,
        tableNumber: orderData.tableNumber || orderData.table_number || "N/A",
        tableId: orderData.tableId || orderData.table_id,
        status: orderData.status || "confirmed",
        total: orderData.total || orderData.total_amount || 0,
        createdAt:
          orderData.createdAt ||
          orderData.created_at ||
          new Date().toISOString(),
        items: (orderData.items || orderData.orderItems || []).map(
          (item: any) => ({
            id: item.id || item.itemId,
            productId: item.productId || item.product_id,
            productName:
              item.productName || item.product_name || item.name || "Unknown",
            quantity: item.quantity || 1,
            price: item.price || item.unit_price || 0,
            status: item.status || "pending",
            notes: item.notes || item.special_notes,
          })
        ),
        branchId: orderData.branchId || orderData.branch_id,
        customerId: orderData.customerId || orderData.customer_id,
        notes: orderData.notes || orderData.special_notes,
      };

      // Add to Redux store
      dispatch(addOrder(newOrder));

      // Play notification sound
      playNotificationSound();

      // Show toast notification
      showNewOrderNotification(newOrder.orderNumber, newOrder.tableNumber);

      console.log(`✅ Order ${newOrder.orderNumber} added to KDS`);
    };

    const handleOrderUpdate = (data: any) => {
      console.log("Order update received:", data);
      if (data.orderId || data.id) {
        const updatedOrder: Order = {
          id: data.id || data.orderId,
          orderNumber: data.orderNumber || data.order_id,
          tableNumber: data.tableNumber || data.table_number || "N/A",
          status: data.status || "preparing",
          total: data.total || data.total_amount || 0,
          createdAt:
            data.createdAt || data.created_at || new Date().toISOString(),
          items: (data.items || []).map((item: any) => ({
            id: item.id || item.itemId,
            productId: item.productId || item.product_id,
            productName:
              item.productName || item.product_name || item.name || "Unknown",
            quantity: item.quantity || 1,
            price: item.price || item.unit_price || 0,
            status: item.status || "pending",
            notes: item.notes || item.special_notes,
          })),
        };
        dispatch(updateOrder(updatedOrder));
      }
    };

    // Register event listeners and get cleanup functions
    console.log(
      "📡 Registering event listeners: new_order, kitchen:new_order, order:status_update"
    );
    const cleanup1 = on("new_order", handleNewOrder);
    const cleanup2 = on("kitchen:new_order", handleNewOrder);
    const cleanup3 = on("order:status_update", handleOrderUpdate);

    // Also listen directly on socket for debugging
    const directHandler = (orderData: any) => {
      console.log(
        "📥 Direct socket event received (bypassing hook):",
        orderData
      );
    };
    socket.on("new_order", directHandler);
    socket.on("kitchen:new_order", directHandler);

    console.log("✅ Event listeners registered successfully");

    return () => {
      console.log("🧹 Cleaning up event listeners...");
      cleanup1();
      cleanup2();
      cleanup3();
      socket.off("new_order", directHandler);
      socket.off("kitchen:new_order", directHandler);
    };
  }, [isConnected, socket, on, dispatch, branchId]);

  const handleItemStatusChange = async (
    orderId: string,
    itemId: string,
    newStatus: OrderItem["status"]
  ) => {
    try {
      setItemProcessing((prev) => ({
        ...prev,
        [`${orderId}-${itemId}`]: true,
      }));
      await updateItemStatusAPI(orderId, itemId, newStatus);
      dispatch(updateOrderItemStatus({ orderId, itemId, status: newStatus }));
    } catch (error) {
      console.error("Failed to update item status:", error);
    } finally {
      setItemProcessing((prev) => ({
        ...prev,
        [`${orderId}-${itemId}`]: false,
      }));
    }
  };

  // Filter orders by status
  const activeOrders = orders.filter(
    (order) =>
      order.status === "confirmed" ||
      order.status === "preparing" ||
      order.status === "ready"
  );

  // Sort by creation time (oldest first)
  const sortedOrders = [...activeOrders].sort((a, b) =>
    dayjs(a.createdAt).diff(dayjs(b.createdAt))
  );

  if (loading && orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>
            Kitchen Display System
          </h1>
          <p style={{ margin: "8px 0 0 0", color: "#666", fontSize: "14px" }}>
            Real-time order management for kitchen staff
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Button
            icon={soundEnabled ? <SoundOutlined /> : <PlayCircleOutlined />}
            onClick={testSound}
            type={soundEnabled ? "default" : "primary"}
          >
            {soundEnabled ? "Sound Enabled" : "Enable Sound / Test"}
          </Button>
          <Select
            value={branchId}
            onChange={setBranchId}
            style={{ width: 200 }}
            placeholder="Select Branch"
            loading={branches.length === 0}
          >
            {branches.map((branch) => (
              <Option key={branch.id} value={branch.id}>
                {branch.name}
              </Option>
            ))}
            {branches.length === 0 && (
              <>
                <Option value="branch-001">Branch 1 - Cầu Giấy</Option>
                <Option value="branch-002">Branch 2 - Hoàn Kiếm</Option>
                <Option value="branch-003">Branch 3 - Đống Đa</Option>
              </>
            )}
          </Select>
        </div>
      </div>

      {/* Socket Status */}
      <Alert
        message={
          isConnected
            ? `✅ Connected to server (Socket ID: ${socket?.id || "N/A"})`
            : `⚠️ Disconnected from server${error ? ` - ${error.message}` : ""}`
        }
        description={
          !isConnected
            ? "Make sure backend is running on http://localhost:5000"
            : `Listening for orders in kitchen-${branchId} room`
        }
        type={isConnected ? "success" : "warning"}
        showIcon
        style={{ marginBottom: 16 }}
        action={
          !isConnected ? (
            <Button size="small" onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          ) : null
        }
      />

      {/* Orders Grid */}
      {sortedOrders.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <FireOutlined
              style={{ fontSize: 48, color: "#ccc", marginBottom: 16 }}
            />
            <p style={{ fontSize: "16px", color: "#999" }}>
              Không có đơn hàng nào
            </p>
          </div>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {sortedOrders.map((order) => {
            const elapsed = getElapsedTimeInfo(order.createdAt);
            const allItemsReady = order.items.every(
              (item) => item.status === "ready" || item.status === "served"
            );

            return (
              <Col key={order.id} xs={24} sm={12} lg={8} xl={6}>
                <Card
                  hoverable
                  style={{
                    borderLeft: `4px solid ${elapsed.color}`,
                    height: "100%",
                  }}
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Badge
                          count={order.items.length}
                          style={{ backgroundColor: "#1890ff" }}
                        />
                        <span style={{ marginLeft: 8, fontWeight: "bold" }}>
                          Bàn {order.tableNumber}
                        </span>
                      </div>
                      <Tag color={STATUS_COLORS[order.status]}>
                        {STATUS_LABELS[order.status]}
                      </Tag>
                    </div>
                  }
                  extra={
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 4,
                      }}
                    >
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        #{order.orderNumber}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: elapsed.color,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <ClockCircleOutlined />
                        {elapsed.display}
                      </div>
                    </div>
                  }
                >
                  {/* Order Items */}
                  <div style={{ marginBottom: 16 }}>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: "8px",
                          marginBottom: 8,
                          backgroundColor: "#f9fafb",
                          borderRadius: 4,
                          border:
                            item.status === "ready"
                              ? "1px solid #10b981"
                              : item.status === "cooking"
                              ? "1px solid #1890ff"
                              : "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: 4,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{ fontWeight: "bold", fontSize: "14px" }}
                            >
                              {item.productName}
                            </div>
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              Số lượng: {item.quantity}
                            </div>
                            {item.notes && (
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "#f97316",
                                  marginTop: 4,
                                  fontStyle: "italic",
                                }}
                              >
                                📝 {item.notes}
                              </div>
                            )}
                          </div>
                          <Tag
                            color={ITEM_STATUS_COLORS[item.status]}
                            style={{ marginLeft: 8 }}
                          >
                            {ITEM_STATUS_LABELS[item.status]}
                          </Tag>
                        </div>

                        {/* Item Actions */}
                        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                          {item.status === "pending" && (
                            <Button
                              type="primary"
                              size="small"
                              icon={<PlayCircleOutlined />}
                              loading={itemProcessing[`${order.id}-${item.id}`]}
                              onClick={() =>
                                handleItemStatusChange(
                                  order.id,
                                  item.id,
                                  "cooking"
                                )
                              }
                              style={{ flex: 1 }}
                            >
                              Bắt đầu nấu
                            </Button>
                          )}
                          {item.status === "cooking" && (
                            <Button
                              type="primary"
                              size="small"
                              icon={<CheckCircleOutlined />}
                              loading={itemProcessing[`${order.id}-${item.id}`]}
                              onClick={() =>
                                handleItemStatusChange(
                                  order.id,
                                  item.id,
                                  "ready"
                                )
                              }
                              style={{
                                flex: 1,
                                backgroundColor: "#10b981",
                                borderColor: "#10b981",
                              }}
                            >
                              Hoàn thành
                            </Button>
                          )}
                          {item.status === "ready" && (
                            <Button
                              size="small"
                              icon={<CheckCircleOutlined />}
                              disabled
                              style={{ flex: 1, cursor: "not-allowed" }}
                            >
                              Đã xong
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div
                    style={{
                      paddingTop: 12,
                      borderTop: "1px solid #e5e7eb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>Tổng cộng:</span>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#f97316",
                      }}
                    >
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(order.total)}
                    </span>
                  </div>

                  {/* Order Notes */}
                  {order.notes && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: 8,
                        backgroundColor: "#fef3c7",
                        borderRadius: 4,
                        fontSize: "12px",
                      }}
                    >
                      📝 <strong>Ghi chú:</strong> {order.notes}
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
