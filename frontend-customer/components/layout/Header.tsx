/**
 * Header Component
 * Top navigation bar
 */

'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showCart?: boolean;
}

export default function Header({ title = 'Nhà Hàng', showBack = false, showCart = true }: HeaderProps) {
  const router = useRouter();
  const { getTotalItems } = useCartStore();
  const cartCount = getTotalItems();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {showCart && (
            <button
              onClick={() => router.push('/customer/cart')}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingBag className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

