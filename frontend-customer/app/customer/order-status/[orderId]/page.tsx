/**
 * Order Status Page - Track order status in real-time
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrder, OrderDetail } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import OrderTimeline from '@/components/order/OrderTimeline';
import OrderStatusBadge from '@/components/order/OrderStatusBadge';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const socket = useSocket();

  // Fetch initial order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrder(orderId);
        setOrder(data);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Listen for order status updates
  useEffect(() => {
    if (!socket || !orderId) return;

    socket.emit('join_order', orderId);

    socket.on('order_status_changed', (data: any) => {
      if (data.orderId === orderId) {
        setOrder((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            orderStatus: data.status,
            timeline: [
              ...prev.timeline,
              { status: data.status, timestamp: new Date().toISOString() },
            ],
          };
        });
      }
    });

    return () => {
      socket.off('order_status_changed');
      socket.emit('leave_order', orderId);
    };
  }, [socket, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Lỗi tải đơn hàng
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/customer/menu')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Quay lại thực đơn
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = order.orderStatus === 'completed';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => router.push('/customer/menu')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Trạng thái đơn hàng</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Order Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Mã đơn hàng</p>
              <p className="text-lg font-bold">{order.orderNumber}</p>
            </div>
            <OrderStatusBadge status={order.orderStatus} />
          </div>

          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <p className="text-green-700 font-medium">
                Đơn hàng đã hoàn thành! Chúc bạn ngon miệng!
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-1">Bàn số</p>
            <p className="font-semibold">{order.table.tableNumber}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="font-semibold text-lg mb-4">Tiến trình</h2>
          <OrderTimeline timeline={order.timeline} currentStatus={order.orderStatus} />
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-4">Chi tiết đơn hàng</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    {item.unitPrice.toLocaleString('vi-VN')}đ x {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  {item.subtotal.toLocaleString('vi-VN')}đ
                </p>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng cộng</span>
              <span className="text-orange-500">
                {order.total.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6">
          <button
            onClick={() => router.push('/customer/menu')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Đặt thêm món
          </button>
        </div>
      </div>
    </div>
  );
}

