import { appEvents, EVENT_TYPES } from './eventEmitter';
import { logger } from '@utils/logger';

export function registerLotEvents(): void {
  appEvents.on(EVENT_TYPES.LOT_CREATED, (data) => {
    logger.info(`Nuevo lote creado: ${data.codigo}`, {
      productoId: data.productoId,
      cantidad: data.cantidad,
      creadoPor: data.creadoPor,
    });
  });

  appEvents.on(EVENT_TYPES.LOT_STATUS_CHANGED, (data) => {
    logger.info(`Estado de lote cambiado: ${data.loteId} -> ${data.estadoAnterior} -> ${data.estadoNuevo}`, {
      loteId: data.loteId,
      cambiadoPor: data.cambiadoPor,
    });
  });

  appEvents.on(EVENT_TYPES.LOT_EXPIRED, (data) => {
    logger.warn(`Lote vencido: ${data.codigo}`, {
      loteId: data.loteId,
      fechaCaducidad: data.fechaCaducidad,
      producto: data.producto,
      cantidad: data.cantidad,
    });
  });

  appEvents.on(EVENT_TYPES.LOT_BLOCKED, (data) => {
    logger.warn(`Lote bloqueado: ${data.loteId}`, {
      motivo: data.motivo,
      alertaId: data.alertaId,
      bloqueadoPor: data.bloqueadoPor,
    });
  });

  appEvents.on(EVENT_TYPES.LOT_MOVED, (data) => {
    logger.info(`Lote movido: ${data.loteId}`, {
      origen: data.origen,
      destino: data.destino,
      cantidad: data.cantidad,
      movidoPor: data.movidoPor,
    });
  });

  appEvents.on(EVENT_TYPES.LOT_CONSUMED, (data) => {
    logger.info(`Lote consumido: ${data.loteId}`, {
      cantidadConsumida: data.cantidad,
      produccionId: data.produccionId,
      consumidoPor: data.consumidoPor,
    });
  });

  appEvents.on(EVENT_TYPES.STOCK_LOW, (data) => {
    logger.warn(`Stock bajo: ${data.producto}`, {
      productoId: data.productoId,
      stockActual: data.stockActual,
      stockMinimo: data.stockMinimo,
    });
  });

  appEvents.on(EVENT_TYPES.STOCK_OUT, (data) => {
    logger.error(`Stock agotado: ${data.producto}`, {
      productoId: data.productoId,
    });
  });

  appEvents.on(EVENT_TYPES.FIFO_VIOLATION, (data) => {
    logger.warn(`Violación FIFO detectada`, {
      lotesSeleccionados: data.lotesSeleccionados,
      loteSugerido: data.loteSugerido,
      usuario: data.usuario,
    });
  });

  logger.info('Eventos de lote registrados');
}