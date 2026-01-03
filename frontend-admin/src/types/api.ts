/**
 * API Type Definitions
 * Basic TypeScript interfaces for API responses
 */

// ============================================
// Enums
// ============================================

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PREPARING = "preparing",
  READY = "ready",
  SERVED = "served",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum OrderItemStatus {
  PENDING = "pending",
  PREPARING = "preparing",
  READY = "ready",
  SERVED = "served",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  CASH = "cash",
  CARD = "card",
  VNPAY = "vnpay",
  MOMO = "momo",
  ZALOPAY = "zalopay",
}

export enum ProductStatus {
  AVAILABLE = "available",
  OUT_OF_STOCK = "out_of_stock",
  DISCONTINUED = "discontinued",
}

export enum TableStatus {
  AVAILABLE = "available",
  OCCUPIED = "occupied",
  RESERVED = "reserved",
  CLEANING = "cleaning",
}

export enum CustomerStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
}

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  STAFF = "staff",
  CUSTOMER = "customer",
}

// ============================================
// Base Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

// ============================================
// Product Types
// ============================================

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  status: ProductStatus;
  soldCount?: number;
  rating?: number;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  status?: ProductStatus;
}

export interface UpdateProductRequest {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  categoryId?: string;
  status?: ProductStatus;
}

export interface GetProductsParams {
  category?: string;
  status?: ProductStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================
// Order Types
// ============================================

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  status: OrderItemStatus;
  notes?: string;
}

export interface Order {
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
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt?: string;
}

export interface CreateOrderRequest {
  tableId: string;
  customerId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    notes?: string;
  }>;
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
  status: OrderStatus;
}

export interface UpdateOrderStatusRequest {
  id: string;
  status: OrderStatus;
  notes?: string;
}

export interface UpdateOrderItemStatusRequest {
  orderId: string;
  itemId: string;
  status: OrderItemStatus;
}

export interface GetOrdersParams {
  branchId?: string;
  status?: OrderStatus;
  tableId?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

// ============================================
// Table Types
// ============================================

export interface Table {
  id: string;
  tableNumber: string;
  floor?: number;
  capacity?: number;
  status: TableStatus;
  branchId: string;
}

export interface TableWithOrder extends Table {
  currentOrder?: Order;
}

export interface GetTablesParams {
  branchId: string;
  status?: TableStatus;
  floor?: number;
}

// ============================================
// Customer Types
// ============================================

export interface Customer {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  status: CustomerStatus;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
}

export interface GetCustomersParams {
  search?: string;
  status?: CustomerStatus;
  page?: number;
  limit?: number;
}

// ============================================
// Category Types
// ============================================

export interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

// ============================================
// Branch Types
// ============================================

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}
