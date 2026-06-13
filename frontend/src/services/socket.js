import { io } from 'socket.io-client';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001', {
      auth: { token: localStorage.getItem('proctorx_token') },
    });
  } else {
    socket.auth = { token: localStorage.getItem('proctorx_token') };
    socket.connect();
  }
  return socket;
}
