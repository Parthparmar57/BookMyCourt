import { io } from 'socket.io-client';

/**
 * Shared Socket.IO client (Phase 5).
 *
 * Socket.IO needs a direct connection to the backend origin (it is not proxied
 * through Vite in dev), so it uses VITE_SOCKET_URL. The backend CORS allows the
 * dev client origin. Connection is lazy + reused across hooks.
 */
const URL = import.meta.env.VITE_SOCKET_URL || undefined;

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
