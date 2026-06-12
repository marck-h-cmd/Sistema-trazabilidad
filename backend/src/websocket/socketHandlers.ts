import { Socket, Server } from 'socket.io';
import { appEvents, EVENT_TYPES } from '@events/eventEmitter';
import { logger } from '@utils/logger';
import { prisma } from '@config/database';

export function registerSocketHandlers(socket: Socket, io: Server): void {
  const user = (socket as any).user;

  socket.on('subscribe:lot', async (lotCode: string) => {
    try {
      const lot = await prisma.lote.findUnique({
        where: { codigo: lotCode },
      });

      if (lot) {
        socket.join(`lot:${lot.id}`);
        socket.emit('subscribed:lot', {
          lotId: lot.id,
          codigo: lot.codigo,
          message: `Suscrito a actualizaciones del lote ${lot.codigo}`,
        });
        logger.debug(`Usuario ${user.email} suscrito a lote ${lot.codigo}`);
      } else {
        socket.emit('error', { message: `Lote ${lotCode} no encontrado` });
      }
    } catch (error) {
      logger.error(`Error al suscribir a lote:`, error);
    }
  });

  socket.on('unsubscribe:lot', (lotId: string) => {
    socket.leave(`lot:${lotId}`);
    socket.emit('unsubscribed:lot', {
      lotId,
      message: 'Suscripción cancelada',
    });
  });

  socket.on('subscribe:alerts', () => {
    socket.join('room:alerts');
    socket.emit('subscribed:alerts', {
      message: 'Suscrito a notificaciones de alertas',
    });
  });

  socket.on('subscribe:dashboard', () => {
    socket.join('room:dashboard');
    socket.emit('subscribed:dashboard', {
      message: 'Suscrito a actualizaciones del dashboard',
    });
  });

  socket.on('subscribe:inventory', (warehouseId?: string) => {
    if (warehouseId) {
      socket.join(`warehouse:${warehouseId}`);
    }
    socket.join('room:inventory');
    socket.emit('subscribed:inventory', {
      warehouseId,
      message: 'Suscrito a actualizaciones de inventario',
    });
  });

  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });

  registerEventListeners(socket, user);
}

function registerEventListeners(socket: Socket, user: any): void {
  const handleLotEvent = (event: string, data: any) => {
    if (data.loteId) {
      io.to(`lot:${data.loteId}`).emit(event, data);
    }
  };

  const handleAlertEvent = (event: string, data: any) => {
    io.to('room:alerts').emit(event, data);

    if (data.loteId) {
      io.to(`lot:${data.loteId}`).emit(event, data);
    }
  };

  const handleInventoryEvent = (event: string, data: any) => {
    io.to('room:inventory').emit(event, data);

    if (data.warehouseId) {
      io.to(`warehouse:${data.warehouseId}`).emit(event, data);
    }
  };

  const handleDashboardEvent = (event: string, data: any) => {
    io.to('room:dashboard').emit(event, data);
  };

  appEvents.on(EVENT_TYPES.LOT_CREATED, (data) => handleLotEvent('lot:created', data));
  appEvents.on(EVENT_TYPES.LOT_STATUS_CHANGED, (data) => handleLotEvent('lot:status-changed', data));
  appEvents.on(EVENT_TYPES.LOT_EXPIRED, (data) => handleLotEvent('lot:expired', data));
  appEvents.on(EVENT_TYPES.LOT_BLOCKED, (data) => handleLotEvent('lot:blocked', data));
  appEvents.on(EVENT_TYPES.LOT_MOVED, (data) => handleLotEvent('lot:moved', data));
  appEvents.on(EVENT_TYPES.LOT_CONSUMED, (data) => handleLotEvent('lot:consumed', data));

  appEvents.on(EVENT_TYPES.ALERT_CREATED, (data) => handleAlertEvent('alert:created', data));
  appEvents.on(EVENT_TYPES.ALERT_ACTIVATED, (data) => handleAlertEvent('alert:activated', data));
  appEvents.on(EVENT_TYPES.ALERT_RESOLVED, (data) => handleAlertEvent('alert:resolved', data));
  appEvents.on(EVENT_TYPES.CRISIS_DECLARED, (data) => handleAlertEvent('crisis:declared', data));

  appEvents.on(EVENT_TYPES.INVENTORY_MOVEMENT, (data) => handleInventoryEvent('inventory:movement', data));
  appEvents.on(EVENT_TYPES.STOCK_LOW, (data) => handleInventoryEvent('stock:low', data));
  appEvents.on(EVENT_TYPES.STOCK_OUT, (data) => handleInventoryEvent('stock:out', data));

  appEvents.on(EVENT_TYPES.SHIPMENT_CREATED, (data) => handleDashboardEvent('shipment:created', data));
  appEvents.on(EVENT_TYPES.SHIPMENT_DISPATCHED, (data) => handleDashboardEvent('shipment:dispatched', data));
  appEvents.on(EVENT_TYPES.SHIPMENT_DELIVERED, (data) => handleDashboardEvent('shipment:delivered', data));

  appEvents.on(EVENT_TYPES.PRODUCTION_COMPLETED, (data) => handleDashboardEvent('production:completed', data));
  appEvents.on(EVENT_TYPES.RECEPTION_COMPLETED, (data) => handleDashboardEvent('reception:completed', data));

  socket.on('disconnect', () => {
    appEvents.removeAllListeners();
  });
}

import { io } from './socketServer';