/**
 * Order Store using Zustand
 * Manages current order state
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: OrderItem[];
}

interface OrderStore {
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  clearOrder: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      currentOrder: null,

      setCurrentOrder: (order) => {
        set({ currentOrder: order });
      },

      updateOrderStatus: (orderId, status) => {
        const current = get().currentOrder;
        if (current && current.id === orderId) {
          set({
            currentOrder: {
              ...current,
              status,
            },
          });
        }
      },

      clearOrder: () => {
        set({ currentOrder: null });
      },
    }),
    {
      name: 'qr-order-current-order',
      partialize: (state) => ({
        currentOrder: state.currentOrder,
      }),
    }
  )
);

