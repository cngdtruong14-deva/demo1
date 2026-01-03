import { useState, useEffect } from 'react';
import { Card, Button, Badge, Tag, Statistic, Row, Col, Alert, Spin, Select } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, FireOutlined } from '@ant-design/icons';
import { useSocket } from '../hooks/useSocket';
import { getKitchenOrders, updateOrderStatus, updateOrderItemStatus } from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Option } = Select;

const STATUS_COLORS = {
  pending: 'default',
  confirmed: 'processing',
  preparing: 'warning',
  ready: 'success',
  served: 'purple',
  completed: 'success',
  cancelled: 'error',
};

const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chế biến',
  ready: 'Sẵn sàng',
  served: 'Đã phục vụ',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('1'); // Default branch ID
  const [processing, setProcessing] = useState({});

  // Socket connection for real-time updates
  const { isConnected, on } = useSocket({
    room: { type: 'kitchen', id: branchId },
    enabled: !!branchId,
  });

  // Fetch initial orders
  useEffect(() => {
    loadOrders();
  }, [branchId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getKitchenOrders(branchId, 'preparing');
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for new orders via Socket
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = on('kitchen:new_order', (orderData) => {
      console.log('New order received:', orderData);
      setOrders((prev) => {
        // Check if order already exists
        const exists = prev.find((o) => o.id === orderData.orderId);
        if (exists) return prev;
        return [orderData, ...prev];
      });
    });

    // Listen for order status updates
    const unsubscribeStatus = on('order:status_update', (data) => {
      if (data.orderId) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === data.orderId
              ? { ...order, status: data.status, ...data.order }
              : order
          )
        );
      }
    });

    return () => {
      unsubscribe();
      unsubscribeStatus();
    };
  }, [isConnected, on]);

  const handleStartCooking = async (orderId) => {
    try {
      setProcessing((prev) => ({ ...prev, [orderId]: true }));
      await updateOrderStatus(orderId, 'preparing');
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: 'preparing' } : order
        )
      );
    } catch (error) {
      console.error('Failed to update order:', error);
    } finally {
      setProcessing((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleItemReady = async (orderId, itemId) => {
    try {
      setProcessing((prev) => ({ ...prev, [`${orderId}-${itemId}`]: true }));
      await updateOrderItemStatus(orderId, itemId, 'ready');
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item.id === itemId ? { ...item, status: 'ready' } : item
                ),
              }
            : order
        )
      );
    } catch (error) {
      console.error('Failed to update item:', error);
    } finally {
      setProcessing((prev) => ({ ...prev, [`${orderId}-${itemId}`]: false }));
    }
  };

  const handleOrderReady = async (orderId) => {
    try {
      setProcessing((prev) => ({ ...prev, [orderId]: true }));
      await updateOrderStatus(orderId, 'ready');
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: 'ready' } : order
        )
      );
    } catch (error) {
      console.error('Failed to update order:', error);
    } finally {
      setProcessing((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const calculateElapsedTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return dayjs(timestamp).fromNow();
  };

  const getOrderPriority = (order) => {
    const elapsed = dayjs().diff(dayjs(order.createdAt || order.timestamp), 'minute');
    if (elapsed > 30) return 'high';
    if (elapsed > 15) return 'medium';
    return 'normal';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>
            <FireOutlined /> Kitchen Display System
          </h1>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Select
              value={branchId}
              onChange={setBranchId}
              style={{ width: 200 }}
              placeholder="Select Branch"
            >
              <Option value="1">Branch 1</Option>
              <Option value="2">Branch 2</Option>
            </Select>
            <Badge
              status={isConnected ? 'success' : 'error'}
              text={isConnected ? 'Connected' : 'Disconnected'}
            />
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <Alert
          message="Socket disconnected"
          description="Real-time updates may not work. Please check your connection."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={pendingOrders.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Preparing"
              value={preparingOrders.length}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Ready"
              value={readyOrders.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Orders Grid */}
      <div>
        <h2 style={{ marginBottom: 16 }}>Active Orders</h2>
        <Row gutter={[16, 16]}>
          {orders.length === 0 ? (
            <Col span={24}>
              <Card>
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  No active orders
                </div>
              </Card>
            </Col>
          ) : (
            orders.map((order) => {
              const priority = getOrderPriority(order);
              const elapsedTime = calculateElapsedTime(order.createdAt || order.timestamp);
              const allItemsReady = order.items?.every((item) => item.status === 'ready');

              return (
                <Col key={order.id || order.orderId} xs={24} sm={12} lg={8} xl={6}>
                  <Card
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                          <Tag color={STATUS_COLORS[order.status]}>
                            {STATUS_LABELS[order.status] || order.status}
                          </Tag>
                          <strong>Table {order.tableNumber || order.table?.tableNumber || 'N/A'}</strong>
                        </span>
                        {priority === 'high' && (
                          <Tag color="red">⚠️ URGENT</Tag>
                        )}
                      </div>
                    }
                    extra={
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {elapsedTime}
                      </div>
                    }
                    style={{
                      border: priority === 'high' ? '2px solid #ff4d4f' : '1px solid #d9d9d9',
                      boxShadow: priority === 'high' ? '0 0 10px rgba(255,77,79,0.3)' : 'none',
                    }}
                  >
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                        Order: {order.orderNumber || order.id}
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        <ClockCircleOutlined /> {elapsedTime}
                      </div>
                    </div>

                    {/* Items List */}
                    <div style={{ marginBottom: 16 }}>
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            padding: '8px 0',
                            borderBottom: '1px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 500 }}>
                              {item.productName || item.name} × {item.quantity}
                            </div>
                            {item.notes && (
                              <div style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>
                                📝 {item.notes}
                              </div>
                            )}
                          </div>
                          <Tag
                            color={
                              item.status === 'ready'
                                ? 'success'
                                : item.status === 'preparing'
                                ? 'processing'
                                : 'default'
                            }
                          >
                            {item.status === 'ready' ? '✓' : item.status}
                          </Tag>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                      {order.status === 'pending' || order.status === 'confirmed' ? (
                        <Button
                          type="primary"
                          block
                          loading={processing[order.id || order.orderId]}
                          onClick={() => handleStartCooking(order.id || order.orderId)}
                        >
                          Start Cooking
                        </Button>
                      ) : order.status === 'preparing' ? (
                        <>
                          {order.items?.map((item) => (
                            item.status !== 'ready' && (
                              <Button
                                key={item.id}
                                size="small"
                                block
                                loading={processing[`${order.id || order.orderId}-${item.id}`]}
                                onClick={() => handleItemReady(order.id || order.orderId, item.id)}
                              >
                                Mark {item.productName || item.name} Ready
                              </Button>
                            )
                          ))}
                          {allItemsReady && (
                            <Button
                              type="primary"
                              block
                              loading={processing[order.id || order.orderId]}
                              onClick={() => handleOrderReady(order.id || order.orderId)}
                            >
                              Order Ready
                            </Button>
                          )}
                        </>
                      ) : null}
                    </div>
                  </Card>
                </Col>
              );
            })
          )}
        </Row>
      </div>
    </div>
  );
}

