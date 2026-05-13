// services/socketService.ts
import { io, Socket } from 'socket.io-client';
import { store } from '../redux/store';
import {
  setSocketConnection,
  setConnectionStatus,
  setSocketError,
  clearSocketConnection
} from '../redux/features/socket/socketSlice';

let socketInstance: Socket | null = null;
let isConnecting = false;

export const initializeSocket = (token: string): Promise<Socket> => {
  // Return existing socket if connected
  if (socketInstance && socketInstance.connected) {
    return Promise.resolve(socketInstance);
  }

  // Prevent multiple simultaneous connections
  if (isConnecting) {
    return new Promise((resolve, reject) => {
      const checkConnection = () => {
        if (socketInstance && socketInstance.connected) {
          resolve(socketInstance);
        } else if (!isConnecting) {
          reject(new Error('Connection failed'));
        } else {
          setTimeout(checkConnection, 100);
        }
      };
      checkConnection();
    });
  }

  // Clean up existing socket
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }

  isConnecting = true;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      isConnecting = false;
      store.dispatch(setSocketError('Connection timeout'));
      reject(new Error('Connection timeout'));
    }, 5000);

    socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 500,
      timeout: 5000,
      forceNew: true,
    });

    const setupEventListeners = () => {
      socketInstance?.on('connect', () => {
        clearTimeout(timeout);
        isConnecting = false;
        store.dispatch(setConnectionStatus(true));
        store.dispatch(setSocketConnection(socketInstance?.id || ''));
        store.dispatch(setSocketError('')); // Empty string instead of null
        console.log('Socket connected successfully');
        resolve(socketInstance as Socket);
      });

      socketInstance?.on('disconnect', (reason: string) => {
        console.log('Socket disconnected:', reason);
        store.dispatch(setConnectionStatus(false));
      });

      socketInstance?.on('connect_error', (err: Error) => {
        clearTimeout(timeout);
        isConnecting = false;
        console.error('Socket connection error:', err);
        store.dispatch(setSocketError(err.message));
        reject(err);
      });

      socketInstance?.on('reconnect', () => {
        console.log('Socket reconnected');
        store.dispatch(setConnectionStatus(true));
        store.dispatch(setSocketConnection(socketInstance?.id || ''));
        store.dispatch(setSocketError('')); // Empty string instead of null
      });

      socketInstance?.on('reconnect_error', (err: Error) => {
        console.error('Socket reconnection error:', err);
        store.dispatch(setSocketError(err.message));
      });
    };

    setupEventListeners();
  });
};

export const getSocket = (): Socket | null => {
  return socketInstance;
};

export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }
  isConnecting = false;
  store.dispatch(clearSocketConnection());
};