/**
 * Cart Store using Zustand with localStorage persistence
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/api';

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

interface CartStore {
  items: CartItem[];
  tableId: string | null;
  branchId: string | null;
  
  // Actions
  addItem: (product: Product, quantity?: number, notes?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  setTableId: (tableId: string | null) => void;
  setBranchId: (branchId: string | null) => void;
  
  // Computed
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getItemQuantity: (productId: string) => number;
}

// Validate and sanitize persisted state
const sanitizePersistedState = (state: any) => {
  if (state?.tableId && (
    state.tableId === 'TABLE_UUID' || 
    state.tableId.toLowerCase().includes('uuid') ||
    state.tableId === 'demo-table-1' ||
    state.tableId === 'demo-table'
  )) {
    console.warn('Clearing invalid tableId from localStorage:', state.tableId);
    return { ...state, tableId: null };
  }
  return state;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      tableId: null,
      branchId: null,

      addItem: (product, quantity = 1, notes) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            // Update existing item
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                      notes: notes || item.notes,
                    }
                  : item
              ),
            };
          } else {
            // Add new item
            return {
              items: [...state.items, { product, quantity, notes }],
            };
          }
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      updateNotes: (productId, notes) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, notes } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      setTableId: (tableId) => {
        // Reject invalid table IDs
        if (tableId && (
          tableId === 'TABLE_UUID' || 
          tableId.toLowerCase().includes('uuid') ||
          tableId === 'demo-table-1' ||
          tableId === 'demo-table'
        )) {
          console.warn('Invalid tableId rejected:', tableId);
          set({ tableId: null });
          return;
        }
        set({ tableId });
      },

      setBranchId: (branchId) => {
        set({ branchId });
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getItemQuantity: (productId) => {
        const item = get().items.find((item) => item.product.id === productId);
        return item?.quantity || 0;
      },
    }),
    {
      name: 'qr-order-cart', // localStorage key
      partialize: (state) => {
        // Sanitize before saving
        const sanitized = sanitizePersistedState(state);
        return {
          items: sanitized.items,
          tableId: sanitized.tableId,
          branchId: sanitized.branchId,
        };
      },
      // Sanitize on rehydrate (load from localStorage)
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating cart store:', error);
          return;
        }
        if (state && state.tableId) {
          // Check if tableId is invalid and clear it
          if (
            state.tableId === 'TABLE_UUID' || 
            state.tableId.toLowerCase().includes('uuid') ||
            state.tableId === 'demo-table-1' ||
            state.tableId === 'demo-table'
          ) {
            console.warn('Clearing invalid tableId from localStorage:', state.tableId);
            // Clear invalid tableId immediately
            if (typeof window !== 'undefined') {
              try {
                const stored = localStorage.getItem('qr-order-cart');
                if (stored) {
                  const parsed = JSON.parse(stored);
                  if (parsed.state) {
                    parsed.state.tableId = null;
                    localStorage.setItem('qr-order-cart', JSON.stringify(parsed));
                  }
                }
              } catch (e) {
                console.error('Error clearing invalid tableId:', e);
              }
            }
          }
        }
      },
    }
  )
);

