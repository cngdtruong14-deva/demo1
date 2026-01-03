'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { Product } from '@/lib/api';

interface ProductListItemProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onRemoveFromCart?: (productId: string) => void;
  quantity?: number;
}

export default function ProductListItem({
  product,
  onAddToCart,
  onRemoveFromCart,
  quantity = 0,
}: ProductListItemProps) {
  const [imageError, setImageError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleAdd = () => {
    if (onAddToCart) {
      setIsAnimating(true);
      onAddToCart(product);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleRemove = () => {
    if (onRemoveFromCart && quantity > 0) {
      onRemoveFromCart(product.id);
    }
  };

  // Check if product is AI recommended (has trending or best-seller tag)
  const isAIRecommended = product.tags?.includes('best-seller') || 
                         product.tags?.includes('signature') ||
                         product.sold_count > 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden"
    >
      <div className="flex gap-4 p-4">
        {/* Left: Product Image */}
        <div className="relative flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {product.image_url && !imageError ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 96px, 112px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl">🍽️</span>
            </div>
          )}

          {/* AI Recommendation Badge */}
          {isAIRecommended && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 left-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
            >
              <Sparkles className="w-3 h-3" />
              <span>Chef's Choice</span>
            </motion.div>
          )}

          {/* Trending Badge */}
          {product.tags?.includes('best-seller') && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
            >
              <TrendingUp className="w-3 h-3" />
              <span>Trending</span>
            </motion.div>
          )}

          {/* Spicy Badge */}
          {product.is_spicy && (
            <div className="absolute bottom-1 left-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
              <span>🌶️</span>
              <span>Cay</span>
            </div>
          )}

          {/* Vegetarian Badge */}
          {product.is_vegetarian && (
            <div className="absolute bottom-1 right-1 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-md">
              🌱 Chay
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Product Name */}
          <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-slate-600 mb-2 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Additional Info */}
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
            {product.preparation_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{product.preparation_time} phút</span>
              </div>
            )}
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <span>⭐</span>
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Price and Quantity Controls */}
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xl font-bold text-orange-600">
              {formatPrice(product.price)}
            </span>

            {/* Quantity Stepper */}
            {quantity > 0 ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-orange-50 rounded-full px-2 py-1"
              >
                <button
                  onClick={handleRemove}
                  className="w-7 h-7 rounded-full bg-white text-orange-600 hover:bg-orange-100 flex items-center justify-center transition-colors duration-200 shadow-sm"
                  aria-label="Giảm số lượng"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-bold text-slate-900 min-w-[24px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={handleAdd}
                  className="w-7 h-7 rounded-full bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center transition-colors duration-200 shadow-md"
                  aria-label="Tăng số lượng"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                className="relative w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors duration-200 shadow-md hover:shadow-lg"
                aria-label="Thêm vào giỏ hàng"
              >
                <AnimatePresence>
                  {isAnimating && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      exit={{ scale: 2, opacity: 0 }}
                      className="absolute inset-0 rounded-full bg-white/30"
                    />
                  )}
                </AnimatePresence>
                <Plus className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

