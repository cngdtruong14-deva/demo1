import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  branchId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Load initial state from localStorage
const loadAuthFromStorage = (): AuthState => {
  try {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("auth_user");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        user,
        token,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error("Failed to load auth from localStorage:", error);
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

const initialState: AuthState = loadAuthFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      // Persist to localStorage
      localStorage.setItem("auth_token", action.payload.token);
      localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // Clear localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("auth_user", JSON.stringify(state.user));
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
