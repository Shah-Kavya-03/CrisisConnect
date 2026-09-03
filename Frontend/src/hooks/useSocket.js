import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket(eventHandlers = {}, role = 'Requester') {
  const socketRef = useRef(null);

  useEffect(() => {
    try {
      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        timeout: 4000
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join:role', role);
      });

      Object.entries(eventHandlers).forEach(([event, handler]) => {
        if (typeof handler === 'function') {
          socket.on(event, handler);
        }
      });

      return () => {
        socket.disconnect();
      };
    } catch (err) {}
  }, [role]);

  const emit = (event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    socket: socketRef.current,
    emit
  };
}
