'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { createOrder } from '@/lib/api';

export default function CartPage() {
  const router = useRouter();
  const { items, tableId, branchId, getTotalPrice, updateQuantity, removeItem, updateNotes, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});

  const totalPrice = getTotalPrice();
  const tax = totalPrice * 0.1; // 10% tax
  const finalTotal = totalPrice + tax;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleItemNoteChange = (productId: string, note: string) => {
    setItemNotes(prev => ({ ...prev, [productId]: note }));
    updateNotes(productId, note);
  };

  const handleSubmitOrder = async () => {
    if (!tableId || tableId === 'TABLE_UUID' || tableId.toLowerCase().includes('uuid')) {
      alert('Vui lòng quét mã QR bàn để đặt món. Không tìm thấy thông tin bàn hợp lệ.');
      router.push('/');
      return;
    }

    if (items.length === 0) {
      alert('Giỏ hàng trống');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        tableId,
        customerId: null, // Can be updated later with customer login
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes || itemNotes[item.product.id] || undefined,
        })),
        notes: orderNotes || undefined,
      };

      const order = await createOrder(orderData);
      
      // Clear cart
      clearCart();
      
      // Redirect to order status page
      router.push(`/order/${order.orderId}`);
    } catch (error) {
      console.error('Failed to create order:', error);
      alert(error instanceof Error ? error.message : 'Không thể đặt món. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h1>
          <p className="text-gray-600 mb-4">Hãy thêm món ăn vào giỏ hàng</p>
          <button
            onClick={() => router.push('/')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Xem thực đơn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Quay lại
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold mb-4">Món đã chọn</h2>
          
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                        <p className="text-orange-600 font-bold">{formatPrice(item.product.price)}</p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                      <span className="text-gray-600 ml-auto">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>

                    {/* Item Notes */}
                    <input
                      type="text"
                      placeholder="Ghi chú (ví dụ: Không hành, ít cay...)"
                      value={itemNotes[item.product.id] || item.notes || ''}
                      onChange={(e) => handleItemNoteChange(item.product.id, e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1 mt-2"
                    />
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-red-500 hover:text-red-700 text-xl"
                    aria-label="Xóa món"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Notes */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú cho đơn hàng
          </label>
          <textarea
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Ví dụ: Gọi cơm trước, để riêng nước chấm..."
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-semibold">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thuế (10%):</span>
              <span className="font-semibold">{formatPrice(tax)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-lg font-bold">Tổng cộng:</span>
                <span className="text-lg font-bold text-orange-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitOrder}
          disabled={isSubmitting || !tableId}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              <span>Đang xử lý...</span>
            </span>
          ) : (
            `Đặt món - ${formatPrice(finalTotal)}`
          )}
        </button>

        {!tableId && (
          <p className="text-sm text-red-600 text-center mt-2">
            ⚠️ Vui lòng quét mã QR bàn để đặt món
          </p>
        )}
      </main>
    </div>
  );
}

