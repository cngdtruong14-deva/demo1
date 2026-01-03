/**
 * API Client using Axios
 * Handles all API requests to the backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error
      const message = (error.response.data as any)?.message || error.message;
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error('Network error. Please check your connection.');
    } else {
      throw error;
    }
  }
);

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface MenuResponse {
  branch: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
  };
  categories: Category[];
  metadata: {
    total_categories: number;
    total_products: number;
    generated_at: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  display_order: number;
  status: string;
  product_count: number;
  products: Product[];
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  image_url?: string;
  preparation_time?: number;
  calories?: number;
  is_spicy: boolean;
  is_vegetarian: boolean;
  tags?: string[];
  status: string;
  sold_count: number;
  rating: number;
}

export interface TableInfo {
  id: string;
  table_number: string;
  branch_id: string;
  capacity: number;
  status: string;
  current_order?: {
    id: string;
    order_number: string;
    status: string;
    total: number;
  };
}

export interface OrderItem {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface CreateOrderRequest {
  tableId: string;
  customerId?: string | null;
  items: OrderItem[];
  notes?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  tableNumber: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: string;
  estimatedTime: number;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  table: {
    id: string;
    tableNumber: string;
  };
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    status: string;
    notes?: string;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  timeline: Array<{
    status: string;
    timestamp: string;
  }>;
}

// API Functions

/**
 * Fetch menu by branch ID
 * Falls back to mock data if API is not available
 */
export async function getMenu(branchId: string): Promise<MenuResponse> {
  try {
    const response = await apiClient.get<ApiResponse<MenuResponse>>(`/menu/${branchId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch menu');
    }
    return response.data.data;
  } catch (error) {
    console.warn('API call failed, using mock data:', error);
    return getMenuMock(branchId);
  }
}

/**
 * Mock menu data for development/testing
 * Returns sample data when API is not available
 */
async function getMenuMock(branchId: string): Promise<MenuResponse> {
  // Try to fetch from public folder or use inline mock
  try {
    const response = await fetch('/api/mock-menu.json');
    if (response.ok) {
      const menuData = await response.json();
      return transformMenuData(menuData, branchId);
    }
  } catch (error) {
    console.warn('Could not load mock menu from file, using inline data');
  }
  
  // Fallback to inline mock data
  return transformMenuData(getInlineMockData(), branchId);
}

function transformMenuData(menuData: any, branchId: string): MenuResponse {
  const categoryMap = new Map<string, Category>();
  
  // Initialize categories
  menuData.categories.forEach((cat: any) => {
    categoryMap.set(cat.id, {
      ...cat,
      product_count: 0,
      products: [],
    });
  });
  
  // Assign products to categories
  menuData.products.forEach((prod: any) => {
    const category = categoryMap.get(prod.category_id);
    if (category) {
      category.products!.push({
        ...prod,
        cost_price: prod.cost_price || null,
        image_url: prod.image_url || null,
        preparation_time: prod.preparation_time || null,
        calories: prod.calories || null,
        tags: prod.tags || [],
      });
      category.product_count!++;
    }
  });
  
  const categories = Array.from(categoryMap.values())
    .sort((a, b) => a.display_order - b.display_order);
  
  return {
    branch: {
      id: branchId,
      name: menuData.metadata?.restaurant_name || 'Nhà Hàng Mẫu',
      address: '123 Đường Mẫu, Quận 1, TP.HCM',
      phone: '0123456789',
    },
    categories,
    metadata: {
      total_categories: categories.length,
      total_products: menuData.products?.length || 0,
      generated_at: new Date().toISOString(),
    },
  };
}

function getInlineMockData() {
  // Full inline mock data with 15 products
  return {
    metadata: {
      restaurant_name: 'Nhà Hàng Việt Nam',
    },
    categories: [
      { id: 'cat-001', name: 'Khai Vị', icon: '🥗', display_order: 1, status: 'active', description: 'Món khai vị ngon miệng' },
      { id: 'cat-002', name: 'Món Chính', icon: '🍜', display_order: 2, status: 'active', description: 'Các món ăn chính đặc sắc' },
      { id: 'cat-003', name: 'Đồ Uống', icon: '🥤', display_order: 3, status: 'active', description: 'Nước giải khát, trà, cà phê' },
      { id: 'cat-004', name: 'Tráng Miệng', icon: '🍰', display_order: 4, status: 'active', description: 'Món tráng miệng ngọt ngào' },
    ],
    products: [
      // Khai Vị (3 món)
      {
        id: 'prod-001',
        category_id: 'cat-001',
        name: 'Gỏi Cuốn Tôm Thịt',
        description: 'Bánh tráng cuốn tôm thịt tươi, rau sống, bún',
        price: 45000,
        cost_price: 20000,
        is_spicy: false,
        is_vegetarian: false,
        tags: ['best-seller'],
        status: 'available',
        sold_count: 156,
        rating: 4.5,
      },
      {
        id: 'prod-002',
        category_id: 'cat-001',
        name: 'Chả Giò Rế',
        description: 'Chả giò chiên giòn, nhân thịt và rau củ',
        price: 55000,
        is_spicy: false,
        is_vegetarian: false,
        tags: [],
        status: 'available',
        sold_count: 98,
        rating: 4.3,
      },
      {
        id: 'prod-003',
        category_id: 'cat-001',
        name: 'Salad Trộn',
        description: 'Salad rau củ tươi với sốt đặc biệt',
        price: 40000,
        is_spicy: false,
        is_vegetarian: true,
        tags: ['healthy'],
        status: 'available',
        sold_count: 45,
        rating: 4.0,
      },
      // Món Chính (4 món)
      {
        id: 'prod-004',
        category_id: 'cat-002',
        name: 'Phở Bò Tái',
        description: 'Phở bò truyền thống, nước dùng đậm đà',
        price: 65000,
        is_spicy: false,
        is_vegetarian: false,
        tags: ['best-seller', 'signature'],
        status: 'available',
        sold_count: 342,
        rating: 4.8,
      },
      {
        id: 'prod-005',
        category_id: 'cat-002',
        name: 'Bún Chả Hà Nội',
        description: 'Bún chả với chả nướng thơm ngon',
        price: 60000,
        is_spicy: false,
        is_vegetarian: false,
        tags: ['signature'],
        status: 'available',
        sold_count: 234,
        rating: 4.6,
      },
      {
        id: 'prod-006',
        category_id: 'cat-002',
        name: 'Cơm Tấm Sườn Bì',
        description: 'Cơm tấm với sườn nướng và bì',
        price: 55000,
        is_spicy: false,
        is_vegetarian: false,
        tags: [],
        status: 'available',
        sold_count: 189,
        rating: 4.4,
      },
      {
        id: 'prod-007',
        category_id: 'cat-002',
        name: 'Mì Xào Giòn Hải Sản',
        description: 'Mì xào giòn với hải sản tươi',
        price: 70000,
        is_spicy: true,
        is_vegetarian: false,
        tags: [],
        status: 'available',
        sold_count: 145,
        rating: 4.5,
      },
      // Đồ Uống (5 món)
      {
        id: 'prod-008',
        category_id: 'cat-003',
        name: 'Trà Đá',
        description: 'Trà đá miễn phí',
        price: 0,
        is_spicy: false,
        is_vegetarian: true,
        tags: [],
        status: 'available',
        sold_count: 890,
        rating: 4.0,
      },
      {
        id: 'prod-009',
        category_id: 'cat-003',
        name: 'Nước Cam Vắt',
        description: 'Nước cam tươi vắt 100%',
        price: 25000,
        is_spicy: false,
        is_vegetarian: true,
        tags: ['fresh'],
        status: 'available',
        sold_count: 267,
        rating: 4.7,
      },
      {
        id: 'prod-010',
        category_id: 'cat-003',
        name: 'Cà Phê Sữa Đá',
        description: 'Cà phê phin truyền thống',
        price: 20000,
        is_spicy: false,
        is_vegetarian: true,
        tags: [],
        status: 'available',
        sold_count: 456,
        rating: 4.6,
      },
      {
        id: 'prod-011',
        category_id: 'cat-003',
        name: 'Trà Sữa Trân Châu',
        description: 'Trà sữa với trân châu đường đen',
        price: 35000,
        is_spicy: false,
        is_vegetarian: true,
        tags: ['best-seller'],
        status: 'available',
        sold_count: 312,
        rating: 4.5,
      },
      {
        id: 'prod-012',
        category_id: 'cat-003',
        name: 'Sinh Tố Bơ',
        description: 'Sinh tố bơ béo ngậy',
        price: 30000,
        is_spicy: false,
        is_vegetarian: true,
        tags: [],
        status: 'available',
        sold_count: 178,
        rating: 4.4,
      },
      // Tráng Miệng (3 món)
      {
        id: 'prod-013',
        category_id: 'cat-004',
        name: 'Chè Ba Màu',
        description: 'Chè ba màu truyền thống',
        price: 20000,
        is_spicy: false,
        is_vegetarian: true,
        tags: [],
        status: 'available',
        sold_count: 123,
        rating: 4.2,
      },
      {
        id: 'prod-014',
        category_id: 'cat-004',
        name: 'Bánh Flan Caramen',
        description: 'Bánh flan mềm mịn với caramen',
        price: 25000,
        is_spicy: false,
        is_vegetarian: true,
        tags: [],
        status: 'available',
        sold_count: 156,
        rating: 4.5,
      },
      {
        id: 'prod-015',
        category_id: 'cat-004',
        name: 'Kem Dừa Non',
        description: 'Kem dừa non mát lạnh',
        price: 30000,
        is_spicy: false,
        is_vegetarian: true,
        tags: [],
        status: 'available',
        sold_count: 89,
        rating: 4.3,
      },
    ],
  };
}

/**
 * Get table information
 * Falls back to mock data if API is not available
 */
export async function getTable(tableId: string): Promise<TableInfo> {
  try {
    const response = await apiClient.get<ApiResponse<TableInfo>>(`/tables/${tableId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch table info');
    }
    return response.data.data;
  } catch (error) {
    console.warn('API call failed, using mock table data:', error);
    // Return mock table data for development
    return {
      id: tableId,
      table_number: 'A01',
      branch_id: 'mock-branch-id', // This will trigger mock menu
      capacity: 4,
      status: 'available'
    };
  }
}

/**
 * Create a new order
 */
export async function createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
  const response = await apiClient.post<ApiResponse<CreateOrderResponse>>('/orders', orderData);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to create order');
  }
  return response.data.data;
}

/**
 * Get order details
 */
export async function getOrder(orderId: string): Promise<OrderDetail> {
  const response = await apiClient.get<ApiResponse<OrderDetail>>(`/orders/${orderId}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to fetch order');
  }
  return response.data.data;
}

/**
 * Fetch first available branch (fallback)
 */
export async function getFirstBranch(): Promise<{ id: string; name: string } | null> {
  try {
    const response = await apiClient.get<ApiResponse<Array<{ id: string; name: string }>>>('/branches');
    if (response.data.success && response.data.data && response.data.data.length > 0) {
      return response.data.data[0];
    }
  } catch (error) {
    console.warn('Failed to fetch branches:', error);
  }
  return null;
}

export default apiClient;
