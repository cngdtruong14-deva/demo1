/**
 * Cart Item Component
 * Display individual cart item with quantity controls
 */

'use client';

import { CartItem as CartItemType } from '@/store/cartStore';
import { useCartStore } from '@/store/cartStore';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, updateNotes } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(item.product.id);
    } else {
      updateQuantity(item.product.id, newQuantity);
    }
  };

  const subtotal = item.product.price * item.quantity;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {item.product.image_url ? (
            <Image
              src={item.product.image_url}
              alt={item.product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-3xl">🍽️</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 mb-1 truncate">
            {item.product.name}
          </h3>
          <p className="text-orange-500 font-bold text-lg">
            {item.product.price.toLocaleString('vi-VN')}đ
          </p>

          {/* Notes */}
          {item.notes && (
            <p className="text-sm text-gray-500 mt-1 italic">
              Ghi chú: {item.notes}
            </p>
          )}

          {/* Quantity Controls */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <span className="font-semibold text-lg w-8 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>

            {/* Delete Button */}
            <button
              onClick={() => removeItem(item.product.id)}
              className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtotal */}
      <div className="mt-3 pt-3 border-t flex justify-between items-center">
        <span className="text-sm text-gray-500">Thành tiền</span>
        <span className="font-bold text-lg text-gray-800">
          {subtotal.toLocaleString('vi-VN')}đ
        </span>
      </div>
    </div>
  );
}

