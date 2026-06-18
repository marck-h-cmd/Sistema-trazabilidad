'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state) => state.token);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket conectado');
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('WebSocket desconectado:', reason);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error.message);
    });
  }, [token]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback);
    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  useEffect(() => {
    if (token) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  return { socket: socketRef.current, connect, disconnect, subscribe, emit };
}