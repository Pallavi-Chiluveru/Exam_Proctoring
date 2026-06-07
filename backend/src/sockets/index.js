import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export function createSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    } catch {
      socket.user = null;
    }
    next();
  });

  io.on('connection', (socket) => {
    if (socket.user?.role === 'admin') socket.join('admins');

    socket.on('session:join', (sessionId) => {
      socket.join(`session:${sessionId}`);
      socket.to('admins').emit('session:viewer', { sessionId, online: true });
    });

    socket.on('proctor:signal', (payload) => {
      socket.to('admins').emit('session:signals', payload);
    });

    socket.on('webrtc:offer', (payload) => socket.to('admins').emit('webrtc:offer', payload));
    socket.on('webrtc:answer', (payload) => socket.to(`session:${payload.sessionId}`).emit('webrtc:answer', payload));
    socket.on('webrtc:candidate', (payload) => socket.broadcast.emit('webrtc:candidate', payload));

    socket.on('disconnect', () => {
      if (socket.user) io.to('admins').emit('user:offline', { userId: socket.user.id });
    });
  });

  return io;
}

export function getIo() {
  return io;
}
