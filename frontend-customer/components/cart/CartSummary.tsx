'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

export default function CartSummary() {
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

  const handleGoToCart = () => {
    // Allow viewing cart even without table ID (demo mode)
    if (!tableId) {
      console.log('Demo mode: Viewing cart without table ID');
    }
    router.push('/customer/cart');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Cart Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="text-2xl">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {totalItems} {totalItems === 1 ? 'món' : 'món'}
              </p>
              <p className="text-lg font-bold text-orange-600">
                {formatPrice(totalPrice)}
              </p>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleGoToCart}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
          >
            <span>Xem giỏ hàng</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

