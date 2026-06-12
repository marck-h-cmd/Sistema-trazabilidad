import { appEvents, EVENT_TYPES } from './eventEmitter';
import { logger } from '@utils/logger';

export function registerShipmentEvents(): void {
  appEvents.on(EVENT_TYPES.SHIPMENT_CREATED, (data) => {
    logger.info(`Expedición creada: ${data.codigo}`, {
      expedicionId: data.id,
      clienteId: data.clienteId,
      cliente: data.cliente,
      cantidadItems: data.cantidadItems,
      creadaPor: data.creadaPor,
    });
  });

  appEvents.on(EVENT_TYPES.SHIPMENT_DISPATCHED, (data) => {
    logger.info(`Expedición despachada: ${data.codigo}`, {
      expedicionId: data.id,
      fechaEnvio: data.fechaEnvio,
      transportista: data.transportista,
      despachadaPor: data.despachadaPor,
    });
  });

  appEvents.on(EVENT_TYPES.SHIPMENT_DELIVERED, (data) => {
    logger.info(`Expedición entregada: ${data.codigo}`, {
      expedicionId: data.id,
      fechaEntrega: data.fechaEntrega,
      entregadaPor: data.entregadaPor,
    });
  });

  appEvents.on(EVENT_TYPES.SHIPMENT_CANCELLED, (data) => {
    logger.warn(`Expedición cancelada: ${data.codigo}`, {
      expedicionId: data.id,
      motivo: data.motivo,
      canceladaPor: data.canceladaPor,
    });
  });

  appEvents.on(EVENT_TYPES.SHIPMENT_BLOCKED_LOT, (data) => {
    logger.warn(`Lote bloqueado en expedición: ${data.loteCodigo}`, {
      expedicionId: data.expedicionId,
      loteId: data.loteId,
      motivo: data.motivo,
      detectadoPor: data.detectadoPor,
    });
  });

  logger.info('Eventos de expedición registrados');
}

export function registerAllEvents(): void {
  const { registerLotEvents } = require('./lotEvents');
  const { registerAlertEvents } = require('./alertEvents');

  registerLotEvents();
  registerAlertEvents();
  registerShipmentEvents();

  logger.info('Todos los eventos del sistema registrados');
}