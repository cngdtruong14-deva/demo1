'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function PremiumCartBar() {
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
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-orange-200 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Cart Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex-shrink-0"
              >
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-3 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                    >
                      {totalItems > 9 ? '9+' : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                  Tổng cộng
                </p>
                <p className="text-xl font-bold text-orange-600 truncate">
                  {formatPrice(totalPrice)}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {totalItems} {totalItems === 1 ? 'món' : 'món'}
                </p>
              </div>
            </div>

            {/* View Cart Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewCart}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl flex-shrink-0"
            >
              <span>Xem giỏ hàng</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

