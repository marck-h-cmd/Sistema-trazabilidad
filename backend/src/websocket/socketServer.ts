import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '@utils/logger';
import { config } from '@config/app';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '@config/jwt';
import { registerSocketHandlers } from './socketHandlers';

let io: Server | null = null;

export function initializeSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin.split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Token de autenticación requerido'));
      }

      const decoded = jwt.verify(token as string, jwtConfig.secret) as any;
      (socket as any).user = decoded;
      next();
    } catch (error) {
      next(new Error('Token inválido o expirado'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;

    logger.info(`Cliente WebSocket conectado: ${user?.email || 'anónimo'} (${socket.id})`);

    socket.join(`user:${user.id}`);
    socket.join(`role:${user.rol}`);

    registerSocketHandlers(socket, io!);

    socket.emit('connected', {
      message: 'Conectado al servidor de trazabilidad',
      userId: user.id,
      timestamp: new Date().toISOString(),
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Cliente WebSocket desconectado: ${user?.email} (${socket.id}) - Razón: ${reason}`);
    });

    socket.on('error', (error) => {
      logger.error(`Error WebSocket en socket ${socket.id}:`, error);
    });
  });

  logger.info('Servidor WebSocket inicializado');
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Servidor WebSocket no inicializado');
  }
  return io;
}

export function emitToUser(userId: string, event: string, data: any): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitToRole(role: string, event: string, data: any): void {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
}

export function emitToAll(event: string, data: any): void {
  if (io) {
    io.emit(event, data);
  }
}

export function emitToRoom(room: string, event: string, data: any): void {
  if (io) {
    io.to(room).emit(event, data);
  }
}