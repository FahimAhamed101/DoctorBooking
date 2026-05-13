// redux/features/socket/socketSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SocketState {
  socketId: string | null;
  isConnected: boolean;
  error: string | null;
  isInitializing: boolean;
}

const initialState: SocketState = {
  socketId: null,
  isConnected: false,
  error: null,
  isInitializing: false
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocketConnection: (state, action: PayloadAction<string | null>) => {
      state.socketId = action.payload;
      state.error = null;
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setSocketError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isConnected = false;
      state.isInitializing = false;
    },
    setInitializingStatus: (state, action: PayloadAction<boolean>) => {
      state.isInitializing = action.payload;
    },
    clearSocketConnection: (state) => {
      state.socketId = null;
      state.isConnected = false;
      state.error = null;
      state.isInitializing = false;
    }
  }
});

export const { 
  setSocketConnection, 
  setConnectionStatus, 
  setSocketError, 
  setInitializingStatus,
  clearSocketConnection 
} = socketSlice.actions;

export default socketSlice.reducer;