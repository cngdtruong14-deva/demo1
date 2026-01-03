/**
 * Checkout Page - Confirm and place order
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import { createOrder, CreateOrderRequest } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, tableId, getTotalPrice, clearCart, setTableId } = useCartStore();
  const { setCurrentOrder } = useOrderStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // Debug: Log tableId on mount
  useEffect(() => {
    console.log('Checkout page - Current tableId:', tableId);
    if (tableId && (tableId === 'TABLE_UUID' || tableId.toLowerCase().includes('uuid'))) {
      console.warn('Invalid tableId detected, clearing...');
      setTableId(null);
    }
  }, [tableId, setTableId]);

  const totalPrice = getTotalPrice();

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setError('Giỏ hàng trống');
      return;
    }

    // Validate tableId
    if (!tableId || tableId === 'TABLE_UUID' || tableId.toLowerCase().includes('uuid')) {
      setError('Vui lòng quét mã QR bàn để đặt món. Không tìm thấy thông tin bàn hợp lệ.');
      router.push('/');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderData: CreateOrderRequest = {
        tableId: tableId,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes,
        })),
        notes: notes || undefined,
      };

      const result = await createOrder(orderData);

      // Save order to store
      setCurrentOrder({
        id: result.orderId,
        orderNumber: result.orderNumber,
        status: result.status,
        total: result.total,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });

      // Clear cart
      clearCart();

      // Redirect to order status
      router.push(`/customer/order-status/${result.orderId}`);
    } catch (err: any) {
      console.error('Error placing order:', err);
      
      setError(err.message || 'Có lỗi xảy ra khi đặt món. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Giỏ hàng trống
          </h2>
          <button
            onClick={() => router.push('/customer/menu')}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Xem thực đơn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Xác nhận đặt món</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 pb-32">

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="font-semibold text-lg mb-3">Món đã chọn</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.product.name} x{item.quantity}
                </span>
                <span className="font-medium">
                  {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
                </span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Tổng cộng</span>
            <span className="text-orange-500 text-xl">
              {totalPrice.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="font-semibold text-lg mb-3">Ghi chú</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Yêu cầu đặc biệt (nếu có)..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            rows={3}
            disabled={loading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
            {error}
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors shadow-lg flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              `Xác nhận đặt món - ${totalPrice.toLocaleString('vi-VN')}đ`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

