/**
 * Mobile Navigation Component
 * Bottom navigation for mobile devices
 */

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, ShoppingBag, Receipt } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { getTotalItems } = useCartStore();

  const cartCount = getTotalItems();

  const navItems = [
    { icon: Home, label: 'Trang chủ', path: '/' },
    { icon: UtensilsCrossed, label: 'Thực đơn', path: '/customer/menu' },
    { icon: ShoppingBag, label: 'Giỏ hàng', path: '/customer/cart', badge: cartCount },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${
                active ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

