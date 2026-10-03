import { Server } from 'socket.io';
import { env } from '../config/env.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('join_room', (room) => {
      socket.join(room);
    });

    socket.on('leave_room', (room) => {
      socket.leave(room);
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

export const getIO = () => io;

export const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

export const broadcastEvent = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};
