import axios, { AxiosInstance } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ===========================================
// API Functions
// ===========================================

// Auth APIs
export const login = async (email: string, password: string) => {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};

// Kitchen/Order APIs
export const getKitchenOrders = async (branchId: string, status?: string) => {
  const params = status ? { status } : {};
  const response = await apiClient.get(`/orders/kitchen/${branchId}`, {
    params,
  });
  return response.data.data || response.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await apiClient.patch(`/orders/${orderId}/status`, {
    status,
  });
  return response.data;
};

export const updateOrderItemStatus = async (
  orderId: string,
  itemId: string,
  status: string
) => {
  const response = await apiClient.patch(
    `/orders/${orderId}/items/${itemId}/status`,
    { status }
  );
  return response.data;
};

// Product APIs
export const getProducts = async (params?: any) => {
  const response = await apiClient.get("/products", { params });
  return response.data.data || response.data;
};

export const getProduct = async (id: string) => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data.data || response.data;
};

export const createProduct = async (data: any) => {
  const response = await apiClient.post("/products", data);
  return response.data;
};

export const updateProduct = async (id: string, data: any) => {
  const response = await apiClient.patch(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

// Category APIs
export const getCategories = async () => {
  const response = await apiClient.get("/categories");
  return response.data.data || response.data;
};

export const createCategory = async (data: any) => {
  const response = await apiClient.post("/categories", data);
  return response.data;
};

// Order APIs
export const getOrders = async (params?: any) => {
  const response = await apiClient.get("/orders", { params });
  return response.data.data || response.data;
};

export const getOrder = async (id: string) => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data.data || response.data;
};

// Table APIs
export const getTables = async (branchId?: string) => {
  const params = branchId ? { branchId } : {};
  const response = await apiClient.get("/tables", { params });
  return response.data.data || response.data;
};

export const createTable = async (data: any) => {
  const response = await apiClient.post("/tables", data);
  return response.data;
};

export const updateTable = async (id: string, data: any) => {
  const response = await apiClient.patch(`/tables/${id}`, data);
  return response.data;
};

export const generateQR = async (tableId: string) => {
  const response = await apiClient.get(`/tables/${tableId}/qr`);
  return response.data;
};

// Branch APIs
export const getBranches = async () => {
  const response = await apiClient.get("/branches");
  return response.data.data || response.data;
};

export const getBranch = async (id: string) => {
  const response = await apiClient.get(`/branches/${id}`);
  return response.data.data || response.data;
};

export const createBranch = async (data: any) => {
  const response = await apiClient.post("/branches", data);
  return response.data;
};

export const updateBranch = async (id: string, data: any) => {
  const response = await apiClient.patch(`/branches/${id}`, data);
  return response.data;
};

// Customer APIs
export const getCustomers = async (params?: any) => {
  const response = await apiClient.get("/customers", { params });
  return response.data.data || response.data;
};

export const getCustomer = async (id: string) => {
  const response = await apiClient.get(`/customers/${id}`);
  return response.data.data || response.data;
};

// Analytics APIs
export const getSalesReport = async (params: any) => {
  const response = await apiClient.get("/analytics/sales", { params });
  return response.data.data || response.data;
};

export const getRevenueReport = async (params: any) => {
  const response = await apiClient.get("/analytics/revenue", { params });
  return response.data.data || response.data;
};

export const getProductPerformance = async (params?: any) => {
  const response = await apiClient.get("/analytics/products", { params });
  return response.data.data || response.data;
};

export const getPeakHours = async (params?: any) => {
  const response = await apiClient.get("/analytics/peak-hours", { params });
  return response.data.data || response.data;
};

// Settings APIs
export const getPricingRules = async () => {
  const response = await apiClient.get("/settings/pricing-rules");
  return response.data.data || response.data;
};

export const updatePricingRule = async (id: string, data: any) => {
  const response = await apiClient.patch(`/settings/pricing-rules/${id}`, data);
  return response.data;
};

export const getPromotions = async () => {
  const response = await apiClient.get("/promotions");
  return response.data.data || response.data;
};

export const createPromotion = async (data: any) => {
  const response = await apiClient.post("/promotions", data);
  return response.data;
};

export default apiClient;
