import { appEvents, EVENT_TYPES } from './eventEmitter';
import { logger } from '@utils/logger';

export function registerAlertEvents(): void {
  appEvents.on(EVENT_TYPES.ALERT_CREATED, (data) => {
    logger.warn(`Alerta creada: ${data.codigo} - ${data.titulo}`, {
      alertaId: data.id,
      tipo: data.tipo,
      severidad: data.severidad,
      loteId: data.loteId,
      creadaPor: data.creadaPor,
    });
  });

  appEvents.on(EVENT_TYPES.ALERT_ACTIVATED, (data) => {
    logger.error(`ALERTA ACTIVADA: ${data.codigo}`, {
      alertaId: data.id,
      lotesBloqueados: data.lotesBloqueados,
      clientesAfectados: data.clientesAfectados,
      activadaPor: data.activadaPor,
    });
  });

  appEvents.on(EVENT_TYPES.ALERT_RESOLVED, (data) => {
    logger.info(`Alerta resuelta: ${data.codigo}`, {
      alertaId: data.id,
      resueltaPor: data.resueltaPor,
      resolucion: data.resolucion,
    });
  });

  appEvents.on(EVENT_TYPES.ALERT_CLOSED, (data) => {
    logger.info(`Alerta cerrada: ${data.codigo}`, {
      alertaId: data.id,
      cantidadRetirada: data.cantidadRetirada,
      cantidadRecuperada: data.cantidadRecuperada,
      porcentajeRecuperacion: data.porcentajeRecuperacion,
    });
  });

  appEvents.on(EVENT_TYPES.CRISIS_DECLARED, (data) => {
    logger.error(`CRISIS DECLARADA: ${data.codigo}`, {
      alertaId: data.id,
      totalLotesAfectados: data.totalLotesAfectados,
      totalClientesAfectados: data.totalClientesAfectados,
      impactoEstimado: data.impactoEstimado,
    });
  });

  logger.info('Eventos de alerta registrados');
}