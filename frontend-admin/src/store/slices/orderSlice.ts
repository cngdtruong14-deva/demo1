import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  status: 'pending' | 'cooking' | 'ready' | 'served';
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  tableId?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  total: number;
  createdAt: string;
  items: OrderItem[];
  branchId?: string;
  customerId?: string;
  notes?: string;
}

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  loading: false,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    removeOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter((o) => o.id !== action.payload);
      if (state.selectedOrder?.id === action.payload) {
        state.selectedOrder = null;
      }
    },
    updateOrderItemStatus: (
      state,
      action: PayloadAction<{ orderId: string; itemId: string; status: OrderItem['status'] }>
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        const item = order.items.find((i) => i.id === action.payload.itemId);
        if (item) {
          item.status = action.payload.status;
        }
        // Update order status if all items are ready
        const allReady = order.items.every((i) => i.status === 'ready' || i.status === 'served');
        if (allReady && order.items.length > 0) {
          order.status = 'ready';
        }
      }
    },
  },
});

export const {
  setOrders,
  addOrder,
  updateOrder,
  removeOrder,
  setSelectedOrder,
  setLoading,
  updateOrderItemStatus,
} = orderSlice.actions;
export default orderSlice.reducer;

