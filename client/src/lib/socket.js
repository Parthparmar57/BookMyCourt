import { io } from 'socket.io-client';

/**
 * Shared Socket.IO client (Phase 5).
 *
 * Socket.IO needs a direct connection to the backend origin (it is not proxied
 * through Vite in dev), so it uses VITE_SOCKET_URL. The backend CORS allows the
 * dev client origin. Connection is lazy + reused across hooks.
 */
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
};

const URL = getSocketUrl();

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(URL, {
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
