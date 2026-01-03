import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authSlice from "./slices/authSlice";
import orderSlice from "./slices/orderSlice";
import productSlice from "./slices/productSlice";
import { apiSlice } from "./api/apiSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    orders: orderSlice,
    products: productSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(apiSlice.middleware),
  devTools: import.meta.env.DEV,
});

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
