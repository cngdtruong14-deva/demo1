/**
 * useAuth Hook
 * Convenient hook to access auth store
 */

'use client';

import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const store = useAuthStore();

  return {
    customer: store.customer,
    isAuthenticated: store.isAuthenticated,
    setCustomer: store.setCustomer,
    logout: store.logout,
  };
}

