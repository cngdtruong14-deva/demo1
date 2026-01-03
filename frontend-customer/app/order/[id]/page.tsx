'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrder, OrderDetail } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: '✅' },
  preparing: { label: 'Đang chế biến', color: 'bg-orange-100 text-orange-800', icon: '👨‍🍳' },
  ready: { label: 'Sẵn sàng', color: 'bg-green-100 text-green-800', icon: '🍽️' },
  served: { label: 'Đã phục vụ', color: 'bg-purple-100 text-purple-800', icon: '🎉' },
  completed: { label: 'Hoàn thành', color: 'bg-gray-100 text-gray-800', icon: '✔️' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: '❌' },
};

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Socket connection for real-time updates
  const { isConnected, on } = useSocket({
    room: { type: 'order', id: orderId },
    enabled: !!orderId,
  });

  // Fetch order details
  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const orderData = await getOrder(orderId);
        setOrder(orderData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load order';
        setError(errorMessage);
        console.error('Error loading order:', err);
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // Listen for order status updates via Socket
  useEffect(() => {
    if (!isConnected || !order) return;

    const unsubscribe = on('order:status_update', (data: { orderId: string; status: string; order?: OrderDetail }) => {
      if (data.orderId === orderId) {
        if (data.order) {
          setOrder(data.order);
        } else {
          // Refetch order if full data not provided
          getOrder(orderId).then(setOrder).catch(console.error);
        }
      }
    });

    return unsubscribe;
  }, [isConnected, orderId, order, on]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusInfo = (status: string) => {
    return STATUS_LABELS[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: '📋' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy đơn hàng</h1>
          <p className="text-gray-600 mb-4">{error || 'Đơn hàng không tồn tại'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.orderStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 mb-4"
          >
            ← Về trang chủ
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của bạn</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Order Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">{statusInfo.icon}</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{order.orderNumber}</h2>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Socket Connection Status */}
          <div className="text-center text-xs text-gray-500 mb-4">
            {isConnected ? (
              <span className="text-green-600">🟢 Đang cập nhật real-time</span>
            ) : (
              <span className="text-yellow-600">🟡 Đang kết nối...</span>
            )}
          </div>

          {/* Order Info */}
          <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Bàn:</span>
              <span className="font-semibold">{order.table.tableNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thời gian đặt:</span>
              <span className="font-semibold">{formatDate(order.createdAt)}</span>
            </div>
            {order.customer && (
              <div className="flex justify-between">
                <span className="text-gray-600">Khách hàng:</span>
                <span className="font-semibold">{order.customer.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Chi tiết món ăn</h3>
          
          <div className="space-y-4">
            {order.items.map((item) => {
              const itemStatusInfo = getStatusInfo(item.status);
              return (
                <div key={item.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${itemStatusInfo.color}`}>
                          {itemStatusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-gray-500 mt-1">📝 {item.notes}</p>
                      )}
                    </div>
                    <span className="font-semibold text-orange-600">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Timeline */}
        {order.timeline && order.timeline.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Lịch sử đơn hàng</h3>
            
            <div className="space-y-3">
              {order.timeline.map((event, index) => {
                const eventStatusInfo = getStatusInfo(event.status);
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${eventStatusInfo.color} flex-shrink-0`}>
                      {eventStatusInfo.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{eventStatusInfo.label}</p>
                      <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Tóm tắt thanh toán</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-semibold">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá:</span>
                <span className="font-semibold">-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Thuế:</span>
              <span className="font-semibold">{formatPrice(order.tax)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-lg font-bold">Tổng cộng:</span>
                <span className="text-lg font-bold text-orange-600">{formatPrice(order.total)}</span>
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-600">Trạng thái thanh toán:</span>
              <span className={`font-semibold ${
                order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
          >
            Đặt thêm món
          </button>
          {order.orderStatus === 'completed' && order.paymentStatus !== 'paid' && (
            <button
              onClick={() => {
                // TODO: Navigate to payment page
                alert('Tính năng thanh toán sẽ được triển khai sớm');
              }}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Thanh toán
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

