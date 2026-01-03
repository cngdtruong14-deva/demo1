/**
 * Cart Page - Full view of cart items
 */

'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import CartItem from '@/components/cart/CartItem';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-500 mb-6">
            Hãy thêm món ăn vào giỏ hàng để tiếp tục
          </p>
          <button
            onClick={() => router.push('/customer/menu')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
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
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">
            Giỏ hàng ({totalItems} món)
          </h1>
        </div>
      </div>

      {/* Cart Items */}
      <div className="max-w-2xl mx-auto p-4 pb-24">
        <div className="space-y-3">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </div>
      </div>

      {/* Fixed Bottom Bar with Order Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Tổng cộng</p>
            <p className="text-2xl font-bold text-orange-500">
              {totalPrice.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <button
            onClick={() => router.push('/customer/checkout')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg text-lg min-w-[140px]"
          >
            Đặt món
          </button>
        </div>
      </div>
    </div>
  );
}

