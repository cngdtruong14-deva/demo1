'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  quantity?: number;
}

export default function ProductCard({ product, onAddToCart, quantity = 0 }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAddToCart = async () => {
    if (onAddToCart) {
      setIsAdding(true);
      setIsAnimating(true);
      try {
        await onAddToCart(product);
        // Reset animation after a short delay
        setTimeout(() => setIsAnimating(false), 300);
      } finally {
        setIsAdding(false);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {/* Product Image */}
      <div className="relative w-full h-48 bg-gray-200">
        {product.image_url && !imageError ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-4xl text-gray-400">🍽️</span>
          </div>
        )}
        
        {/* Spicy Badge */}
        {product.is_spicy && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <span>🌶️</span>
            <span>Cay</span>
          </div>
        )}

        {/* Vegetarian Badge */}
        {product.is_vegetarian && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            🌱 Chay
          </div>
        )}

        {/* Tags Badge */}
        {product.tags && product.tags.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
            {product.tags.includes('best-seller') && (
              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">
                ⭐ Bán chạy
              </span>
            )}
            {product.tags.includes('signature') && (
              <span className="bg-purple-400 text-purple-900 px-2 py-1 rounded text-xs font-semibold">
                ✨ Đặc sản
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Additional Info */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          {product.preparation_time && (
            <span className="flex items-center gap-1">
              <span>⏱️</span>
              <span>{product.preparation_time} phút</span>
            </span>
          )}
        </div>

        {/* Price and Add Button */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xl font-bold text-orange-600">
            {formatPrice(product.price)}
          </span>
          
          {/* Add Button with Animation */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`
              relative bg-orange-500 hover:bg-orange-600 text-white 
              w-10 h-10 rounded-full font-semibold 
              transition-all duration-300 
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center
              ${isAnimating ? 'scale-125' : 'scale-100'}
              ${quantity > 0 ? 'ring-2 ring-orange-300 ring-offset-2' : ''}
            `}
            aria-label="Thêm vào giỏ hàng"
          >
            {isAdding ? (
              <span className="animate-spin text-lg">⏳</span>
            ) : quantity > 0 ? (
              <span className="text-lg font-bold">{quantity}</span>
            ) : (
              <span className="text-xl font-bold transform transition-transform duration-200 hover:scale-110">
                +
              </span>
            )}
            
            {/* Ripple effect on click */}
            {isAnimating && (
              <span className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
