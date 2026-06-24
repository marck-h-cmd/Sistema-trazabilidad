import { prisma } from '@config/database';
import { getPaginationParams, getPaginationMeta } from '@utils/pagination';
import { appEvents, EVENT_TYPES } from '@appEvents/eventEmitter';

export class AuditService {
  async logAction(data: {
    usuarioId: string;
    accion: string;
    entidad: string;
    entidadId?: string;
    valorAnterior?: any;
    valorNuevo?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const log = await prisma.registroAuditoria.create({
      data: {
        usuarioId: data.usuarioId,
        accion: data.accion,
        entidad: data.entidad,
        entidadId: data.entidadId,
        valorAnterior: data.valorAnterior,
        valorNuevo: data.valorNuevo,
        direccionIp: data.ipAddress,
        agenteUsuario: data.userAgent,
      },
    });

    appEvents.emitEvent(EVENT_TYPES.AUDIT_ACTION, {
      logId: log.id,
      usuarioId: data.usuarioId,
      accion: data.accion,
      entidad: data.entidad,
      entidadId: data.entidadId,
    });

    return log;
  }

  async getLogs(query: {
    page?: number;
    limit?: number;
    usuarioId?: string;
    accion?: string;
    entidad?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: any = {};

    if (query.usuarioId) where.usuarioId = query.usuarioId;
    if (query.accion) where.accion = query.accion;
    if (query.entidad) where.entidad = query.entidad;
    if (query.fechaDesde || query.fechaHasta) {
      where.creadoEn = {};
      if (query.fechaDesde) where.creadoEn.gte = new Date(query.fechaDesde);
      if (query.fechaHasta) where.creadoEn.lte = new Date(query.fechaHasta);
    }

    const [logs, total] = await Promise.all([
      prisma.registroAuditoria.findMany({
        where,
        skip,
        take,
        orderBy: { creadoEn: 'desc' },
        include: {
          usuario: { select: { email: true, nombre: true, apellido: true } },
        },
      }),
      prisma.registroAuditoria.count({ where }),
    ]);

    return {
      data: logs,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async createSimulation(loteId: string, userId: string) {
    const simulation = await prisma.simulacroAuditoria.create({
      data: {
        loteId,
        realizadoPor: userId,
      },
    });

    appEvents.emitEvent(EVENT_TYPES.SIMULATION_STARTED, {
      simulationId: simulation.id,
      loteId,
      realizadoPor: userId,
    });

    return simulation;
  }

  async completeSimulation(simulationId: string, results: {
    tiempoIdentificarClientes: number;
    tiempoLocalizarStock: number;
    tiempoGenerarReporte: number;
    clientesEncontrados: number;
    stockLocalizado: number;
  }) {
    const tiempoTotal = results.tiempoIdentificarClientes + results.tiempoLocalizarStock + results.tiempoGenerarReporte;
    const tasaRecuperacion = results.stockLocalizado > 0 ? 95 : 0;
    const aprobado = tiempoTotal <= 3600 && tasaRecuperacion >= 95;

    const simulation = await prisma.simulacroAuditoria.update({
      where: { id: simulationId },
      data: {
        tiempoIdentificarClientes: results.tiempoIdentificarClientes,
        tiempoLocalizarStock: results.tiempoLocalizarStock,
        tiempoGenerarReporte: results.tiempoGenerarReporte,
        tiempoTotal,
        clientesEncontrados: results.clientesEncontrados,
        stockLocalizado: results.stockLocalizado,
        tasaRecuperacion,
        aprobado,
      },
    });

    appEvents.emitEvent(EVENT_TYPES.SIMULATION_COMPLETED, {
      simulationId,
      aprobado,
      tiempoTotal,
      tasaRecuperacion,
    });

    return simulation;
  }

  async getSimulations(query: { page?: number; limit?: number }) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const [simulations, total] = await Promise.all([
      prisma.simulacroAuditoria.findMany({
        skip,
        take,
        orderBy: { creadoEn: 'desc' },
        include: {
          lote: { select: { codigo: true } },
          usuario: { select: { nombre: true, apellido: true } },
        },
      }),
      prisma.simulacroAuditoria.count(),
    ]);

    return {
      data: simulations,
      pagination: getPaginationMeta(total, page, limit),
    };
  }
}