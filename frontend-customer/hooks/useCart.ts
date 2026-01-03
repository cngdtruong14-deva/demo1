/**
 * useCart Hook
 * Convenient hook to access cart store
 */

'use client';

import { useCartStore } from '@/store/cartStore';
import { Product } from '@/lib/api';

export function useCart() {
  const store = useCartStore();

  return {
    items: store.items,
    tableId: store.tableId,
    branchId: store.branchId,
    totalPrice: store.getTotalPrice(),
    totalItems: store.getTotalItems(),
    addItem: (product: Product, quantity?: number, notes?: string) =>
      store.addItem(product, quantity, notes),
    removeItem: (productId: string) => store.removeItem(productId),
    updateQuantity: (productId: string, quantity: number) =>
      store.updateQuantity(productId, quantity),
    updateNotes: (productId: string, notes: string) =>
      store.updateNotes(productId, notes),
    clearCart: () => store.clearCart(),
    getItemQuantity: (productId: string) => store.getItemQuantity(productId),
    setTableId: (tableId: string | null) => store.setTableId(tableId),
    setBranchId: (branchId: string | null) => store.setBranchId(branchId),
  };
}

