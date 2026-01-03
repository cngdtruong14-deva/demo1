import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  status: string;
}

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  loading: false,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setSelectedProduct,
  setLoading,
} = productSlice.actions;
export default productSlice.reducer;

