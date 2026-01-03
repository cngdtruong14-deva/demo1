'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

export default function CartFloatingBar() {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems, tableId } = useCartStore();

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  // Don't show if cart is empty
  if (totalItems === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleViewCart = () => {
    if (!tableId) {
      alert('Vui lòng quét mã QR bàn để tiếp tục');
      return;
    }
    router.push('/cart');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-orange-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Cart Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-orange-100 p-3 rounded-full">
                <span className="text-2xl">🛒</span>
              </div>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Tổng cộng
              </p>
              <p className="text-xl font-bold text-orange-600">
                {formatPrice(totalPrice)}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {totalItems} {totalItems === 1 ? 'món' : 'món'}
              </p>
            </div>
          </div>

          {/* View Cart Button */}
          <button
            onClick={handleViewCart}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>Xem giỏ hàng</span>
            <span className="text-lg">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

