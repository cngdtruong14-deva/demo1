/**
 * Cart Drawer Component
 * Sliding drawer showing cart items (mobile-friendly)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import CartItem from './CartItem';
import { X, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const handleCheckout = () => {
    onClose();
    router.push('/customer/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Giỏ hàng ({totalItems})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 pb-32">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Giỏ hàng trống</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Tổng cộng</span>
              <span className="text-2xl font-bold text-orange-500">
                {totalPrice.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg transition-colors shadow-lg"
            >
              Đặt món
            </button>
          </div>
        )}
      </div>
    </>
  );
}

