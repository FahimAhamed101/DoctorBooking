// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './features/auth/authApi';
import { blogApi } from "./features/blog/blogApi";
import { appointmentApi } from './features/auth/appontmentApi'; // Fixed path
import authReducer from "./features/auth/authSlice";
import { infoApi } from './features/info/infoApi';
import { aboutMeApi } from './features/aboutMe/aboutMeApi';
import { subscriptionApi } from './features/subscription/subscriptionApi';
import socketReducer from './features/socket/socketSlice';
import conversationReducer from "./features/socket/conversationSlice";
import { valueApi } from './features/values/valueApi';
export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,conversation: conversationReducer,  [infoApi.reducerPath]: infoApi.reducer, [subscriptionApi.reducerPath]: subscriptionApi.reducer, socket: socketReducer,
    auth: authReducer,
    [appointmentApi.reducerPath]: appointmentApi.reducer, [aboutMeApi.reducerPath]: aboutMeApi.reducer,
    [blogApi.reducerPath]: blogApi.reducer,  [valueApi.reducerPath]: valueApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      blogApi.middleware,infoApi.middleware,aboutMeApi.middleware,subscriptionApi.middleware,valueApi.middleware,
      appointmentApi.middleware // Added missing middleware
    )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;