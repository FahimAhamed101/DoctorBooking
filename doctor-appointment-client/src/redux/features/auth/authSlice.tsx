// src/redux/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: null | {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  profileImage: string;
    // Add other user fields as needed
  };
  tokens: null | {
    access: {
      token: string;
      expires: string;
    };
    refresh: {
      token: string;
      expires: string;
    };
  };
  isAuthenticated: boolean;
}

// Helper function to load initial state from localStorage
const loadInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        return JSON.parse(storedAuth);
      } catch (e) {
        console.error('Failed to parse stored auth state', e);
      }
    }
  }
  return {
    user: null,
    tokens: null,
    
    isAuthenticated: false,
  };
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthState>) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      // Save to localStorage
      localStorage.setItem('auth', JSON.stringify(state));
   
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      // Clear from localStorage
      localStorage.removeItem('auth');
      localStorage.removeItem('accessToken');
      
    },
    // Add a reducer to update user profile
    updateUser: (state, action: PayloadAction<Partial<AuthState['user']>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('auth', JSON.stringify(state));
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;