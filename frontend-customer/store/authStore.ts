/**
 * Auth Store using Zustand
 * Manages customer authentication state (optional)
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface AuthStore {
  customer: Customer | null;
  isAuthenticated: boolean;
  setCustomer: (customer: Customer | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      customer: null,
      isAuthenticated: false,

      setCustomer: (customer) => {
        set({
          customer,
          isAuthenticated: !!customer,
        });
      },

      logout: () => {
        set({
          customer: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'qr-order-auth',
      partialize: (state) => ({
        customer: state.customer,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

