/**
 * API Service using Axios
 * Handles all API requests to the backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || error.message;
      console.error('API Error:', message);
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error('Network error. Please check your connection.');
    } else {
      throw error;
    }
  }
);

// API Functions

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(branchId) {
  const response = await apiClient.get(`/admin/dashboard/stats`, {
    params: { branchId },
  });
  return response.data.data;
}

/**
 * Get orders for kitchen
 */
export async function getKitchenOrders(branchId, status = 'pending') {
  const response = await apiClient.get(`/orders`, {
    params: { branchId, status },
  });
  return response.data.data || [];
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, status, notes = '') {
  const response = await apiClient.put(`/orders/${orderId}/status`, {
    status,
    notes,
  });
  return response.data.data;
}

/**
 * Update order item status
 */
export async function updateOrderItemStatus(orderId, itemId, status) {
  const response = await apiClient.put(`/orders/${orderId}/items/${itemId}/status`, {
    status,
  });
  return response.data.data;
}

/**
 * Get order details
 */
export async function getOrder(orderId) {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data.data;
}

/**
 * Get analytics data
 */
export async function getAnalytics(branchId, period = 'today') {
  const response = await apiClient.get(`/admin/analytics/revenue`, {
    params: { branchId, period },
  });
  return response.data.data;
}

/**
 * Get menu matrix data (for scatter chart)
 */
export async function getMenuMatrix(branchId) {
  // This endpoint might not exist yet, return mock data structure
  try {
    const response = await apiClient.get(`/admin/analytics/menu-matrix`, {
      params: { branchId },
    });
    return response.data.data;
  } catch (error) {
    // Return mock data if endpoint doesn't exist
    console.warn('Menu matrix endpoint not available, using mock data');
    return null;
  }
}

/**
 * Get branches list
 */
export async function getBranches() {
  const response = await apiClient.get(`/branches`);
  return response.data.data || [];
}

export default apiClient;

