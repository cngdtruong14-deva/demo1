import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { logout } from "../slices/authSlice";
import type {
  LoginRequest,
  LoginResponse,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  GetProductsParams,
  Order,
  UpdateOrderStatusRequest,
  UpdateOrderItemStatusRequest,
  GetOrdersParams,
  Table,
  TableWithOrder,
  GetTablesParams,
  GetCustomersParams,
  Customer,
} from "../../types/api";

// Base URL
const API_BASE_URL =
  import.meta.env?.VITE_API_URL || "http://localhost:5000/api/v1";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth?.token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");

    return headers;
  },
});

// Base query with re-authentication logic
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Products", "Orders", "Tables", "Customers", "Categories"],
  endpoints: (builder) => ({
    // ============================================
    // Categories
    // ============================================
    getCategories: builder.query<any, void>({
      query: () => "/categories",
      providesTags: ["Categories"],
    }),

    // ============================================
    // Authentication
    // ============================================
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // ============================================
    // Products
    // ============================================
    getProducts: builder.query<Product[], GetProductsParams | void>({
      query: (params) => ({
        url: "/products",
        params: params || {},
      }),
      providesTags: ["Products"],
    }),

    getProduct: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Products", id }],
    }),

    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (product) => ({
        url: "/products",
        method: "POST",
        body: product,
      }),
      invalidatesTags: ["Products"],
    }),

    updateProduct: builder.mutation<Product, UpdateProductRequest>({
      query: ({ id, ...product }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: product,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Products", id },
        "Products",
      ],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Products", id },
        "Products",
      ],
    }),

    // ============================================
    // Orders
    // ============================================
    getOrders: builder.query<Order[], GetOrdersParams | void>({
      query: (params) => ({
        url: "/orders",
        params: params || {},
      }),
      providesTags: ["Orders"],
    }),

    getOrder: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Orders", id }],
    }),

    updateOrderStatus: builder.mutation<Order, UpdateOrderStatusRequest>({
      query: ({ id, status, notes }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        body: { status, notes },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Orders", id },
        "Orders",
      ],
    }),

    updateOrderItemStatus: builder.mutation<
      Order,
      UpdateOrderItemStatusRequest
    >({
      query: ({ orderId, itemId, status }) => ({
        url: `/orders/${orderId}/items/${itemId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: "Orders", id: orderId },
        "Orders",
      ],
    }),

    // ============================================
    // Tables
    // ============================================
    getTables: builder.query<Table[], GetTablesParams>({
      query: (params) => ({
        url: "/tables",
        params,
      }),
      providesTags: ["Tables"],
    }),

    getTable: builder.query<TableWithOrder, string>({
      query: (id) => `/tables/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Tables", id }],
    }),

    // ============================================
    // Customers
    // ============================================
    getCustomers: builder.query<Customer[], GetCustomersParams | void>({
      query: (params) => ({
        url: "/customers",
        params: params || {},
      }),
      providesTags: ["Customers"],
    }),

    getCustomer: builder.query<Customer, string>({
      query: (id) => `/customers/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Customers", id }],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderItemStatusMutation,
  useGetTablesQuery,
  useGetTableQuery,
  useGetCustomersQuery,
  useGetCustomerQuery,
  useGetCategoriesQuery,
} = apiSlice;
