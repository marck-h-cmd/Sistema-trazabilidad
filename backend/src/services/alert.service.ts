import { AlertRepository } from '@repositories/alert.repository';
import { LotService } from '@services/lot.service';
import { ApiError } from '@utils/errors';
import { generateAlertCode } from '@utils/lotGenerator';
import { appEvents, EVENT_TYPES } from '@events/eventEmitter';
import { prisma } from '@config/database';
import { getPaginationParams, getPaginationMeta } from '@utils/pagination';
import { CreateAlertDTO, UpdateAlertDTO, AlertImpactDTO, AlertQueryParams } from '@customTypes/alert.types';
import { sendBulkNotifications } from '@queues/notification.queue';
import { addEmailToQueue } from '@queues/email.queue';

export class AlertService {
  private alertRepository: AlertRepository;
  private lotService: LotService;

  constructor() {
    this.alertRepository = new AlertRepository();
    this.lotService = new LotService();
  }

  async findAll(query: AlertQueryParams) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: any = {};

    if (query.estado) where.estado = query.estado;
    if (query.severidad) where.severidad = query.severidad;
    if (query.tipo) where.tipo = query.tipo;
    if (query.loteId) where.loteId = query.loteId;
    if (query.fechaDesde || query.fechaHasta) {
      where.fechaCreacion = {};
      if (query.fechaDesde) where.fechaCreacion.gte = new Date(query.fechaDesde);
      if (query.fechaHasta) where.fechaCreacion.lte = new Date(query.fechaHasta);
    }

    const { alerts, total } = await this.alertRepository.findAll({
      skip,
      take,
      where,
    });

    return {
      data: alerts,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string) {
    const alert = await this.alertRepository.findById(id);

    if (!alert) {
      throw ApiError.notFound('Alerta no encontrada');
    }

    return alert;
  }

  async findByCode(codigo: string) {
    const alert = await this.alertRepository.findByCode(codigo);

    if (!alert) {
      throw ApiError.notFound('Alerta no encontrada');
    }

    return alert;
  }

  async create(data: CreateAlertDTO, userId: string) {
    await this.lotService.findById(data.loteId);

    const codigo = await generateAlertCode();

    const alert = await this.alertRepository.create({
      codigo,
      lote: { connect: { id: data.loteId } },
      tipo: data.tipo as any,
      severidad: data.severidad as any,
      estado: 'ABIERTA',
      titulo: data.titulo,
      descripcion: data.descripcion,
      lotesAfectados: [data.loteId],
      clientesAfectados: [],
      creador: { connect: { id: userId } },
    });

    appEvents.emitEvent(EVENT_TYPES.ALERT_CREATED, {
      id: alert.id,
      codigo,
      tipo: data.tipo,
      severidad: data.severidad,
      loteId: data.loteId,
      titulo: data.titulo,
      creadaPor: userId,
    });

    return this.findById(alert.id);
  }

  async analyzeImpact(alertId: string): Promise<AlertImpactDTO> {
    const alert = await this.findById(alertId);

    const materiasPrimasIds = await this.findRelatedRawMaterials(alert.loteId);
    const lotesAfectadosSet = new Set<string>([alert.loteId]);

    for (const mpId of materiasPrimasIds) {
      const lotesRelacionados = await prisma.produccion.findMany({
        where: {
          materiasPrimas: { some: { loteId: mpId } },
        },
        select: { loteId: true },
      });

      lotesRelacionados.forEach((l) => lotesAfectadosSet.add(l.loteId));
    }

    const lotesAfectadosIds = Array.from(lotesAfectadosSet);
    const lotesAfectadosData = [];
    let cantidadPendienteAlmacen = 0;

    for (const loteId of lotesAfectadosIds) {
      const lote = await prisma.lote.findUnique({
        where: { id: loteId },
        include: {
          producto: { select: { nombre: true } },
          ubicacion: { select: { codigoCompleto: true } },
        },
      });

      if (lote) {
        lotesAfectadosData.push({
          id: lote.id,
          codigo: lote.codigo,
          producto: lote.producto.nombre,
          cantidad: lote.cantidad,
          ubicacion: lote.ubicacion?.codigoCompleto || null,
        });

        if (lote.estado === 'ACTIVO') {
          cantidadPendienteAlmacen += lote.cantidad;
        }
      }
    }

    const clientesAfectadosData: any[] = [];
    const clientesAfectadosSet = new Set<string>();
    let cantidadTotalDistribuida = 0;

    for (const loteId of lotesAfectadosIds) {
      const expediciones = await prisma.itemExpedicion.findMany({
        where: { loteId },
        include: {
          expedicion: {
            include: { cliente: true },
          },
        },
      });

      for (const item of expediciones) {
        const clienteId = item.expedicion.cliente.id;

        if (!clientesAfectadosSet.has(clienteId)) {
          clientesAfectadosSet.add(clienteId);
          clientesAfectadosData.push({
            id: clienteId,
            nombre: item.expedicion.cliente.nombre,
            codigo: item.expedicion.cliente.codigo,
            cantidadRecibida: item.cantidad,
            fechaEnvio: item.expedicion.fechaEnvio,
          });
        } else {
          const existing = clientesAfectadosData.find((c) => c.id === clienteId);
          if (existing) {
            existing.cantidadRecibida += item.cantidad;
          }
        }

        cantidadTotalDistribuida += item.cantidad;
      }
    }

    const porcentajeRecuperable =
      cantidadTotalDistribuida > 0
        ? ((cantidadPendienteAlmacen / (cantidadTotalDistribuida + cantidadPendienteAlmacen)) * 100)
        : 100;

    const impact: AlertImpactDTO = {
      lotesAfectados: lotesAfectadosData,
      clientesAfectados: clientesAfectadosData,
      stockPendiente: {
        totalLotes: lotesAfectadosData.filter((l) => l.ubicacion).length,
        cantidadTotal: cantidadPendienteAlmacen,
      },
      resumen: {
        totalLotesAfectados: lotesAfectadosData.length,
        totalClientesAfectados: clientesAfectadosData.length,
        cantidadTotalDistribuida,
        cantidadPendienteAlmacen,
        porcentajeRecuperable: Math.round(porcentajeRecuperable * 100) / 100,
      },
    };

    await this.alertRepository.update(alertId, {
      lotesAfectados: lotesAfectadosIds,
      clientesAfectados: clientesAfectadosData.map((c) => c.id),
    });

    return impact;
  }

  async activate(alertId: string, userId: string) {
    const alert = await this.findById(alertId);

    if (alert.estado !== 'ABIERTA' && alert.estado !== 'INVESTIGANDO') {
      throw ApiError.badRequest('Solo se pueden activar alertas en estado ABIERTA o INVESTIGANDO');
    }

    const impact = await this.analyzeImpact(alertId);

    const lotesABloquear = impact.lotesAfectados
      .filter((l: any) => l.ubicacion)
      .map((l: any) => l.id);

    if (lotesABloquear.length > 0) {
      await this.lotService.blockLots(lotesABloquear, userId);
    }

    await this.alertRepository.update(alertId, {
      estado: 'INVESTIGANDO',
    });

    const usuariosCalidad = await prisma.usuario.findMany({
      where: { rol: 'CALIDAD', estado: 'ACTIVO' },
      select: { email: true },
    });

    const usuariosAdmin = await prisma.usuario.findMany({
      where: { rol: 'ADMINISTRADOR', estado: 'ACTIVO' },
      select: { email: true },
    });

    const todosDestinatarios = [
      ...usuariosCalidad.map((u) => u.email),
      ...usuariosAdmin.map((u) => u.email),
    ];

    if (todosDestinatarios.length > 0) {
      const asunto = `[${alert.severidad}] Alerta Activada: ${alert.titulo}`;
      const mensaje = `
        <h2>Alerta Activada</h2>
        <p><strong>Código:</strong> ${alert.codigo}</p>
        <p><strong>Lote:</strong> ${alert.lote?.codigo || 'N/A'}</p>
        <p><strong>Tipo:</strong> ${alert.tipo}</p>
        <p><strong>Severidad:</strong> ${alert.severidad}</p>
        <p><strong>Descripción:</strong> ${alert.descripcion}</p>
        <h3>Impacto:</h3>
        <ul>
          <li>Lotes afectados: ${impact.resumen.totalLotesAfectados}</li>
          <li>Clientes afectados: ${impact.resumen.totalClientesAfectados}</li>
          <li>Stock pendiente en almacén: ${impact.resumen.cantidadPendienteAlmacen}</li>
          <li>Cantidad total distribuida: ${impact.resumen.cantidadTotalDistribuida}</li>
          <li>Porcentaje recuperable: ${impact.resumen.porcentajeRecuperable}%</li>
        </ul>
      `;

      await sendBulkNotifications(alertId, todosDestinatarios, asunto, mensaje);
    }

    appEvents.emitEvent(EVENT_TYPES.ALERT_ACTIVATED, {
      id: alertId,
      codigo: alert.codigo,
      lotesBloqueados: lotesABloquear.length,
      clientesAfectados: impact.clientesAfectados.length,
      activadaPor: userId,
    });

    if (alert.severidad === 'CRITICO') {
      appEvents.emitEvent(EVENT_TYPES.CRISIS_DECLARED, {
        id: alertId,
        codigo: alert.codigo,
        totalLotesAfectados: impact.resumen.totalLotesAfectados,
        totalClientesAfectados: impact.resumen.totalClientesAfectados,
        impactoEstimado: impact.resumen.cantidadTotalDistribuida,
      });
    }

    return { alert: await this.findById(alertId), impact };
  }

  async resolve(alertId: string, data: { resolucion: string }, userId: string) {
    const alert = await this.findById(alertId);

    if (alert.estado === 'CERRADA') {
      throw ApiError.badRequest('No se puede resolver una alerta cerrada');
    }

    const updated = await this.alertRepository.update(alertId, {
      estado: 'RESUELTA',
      resolucion: data.resolucion,
      resueltaPor: userId,
      fechaResolucion: new Date(),
    });

    appEvents.emitEvent(EVENT_TYPES.ALERT_RESOLVED, {
      id: alertId,
      codigo: alert.codigo,
      resueltaPor: userId,
      resolucion: data.resolucion,
    });

    return updated;
  }

  async close(alertId: string, userId: string) {
    const alert = await this.findById(alertId);

    if (alert.estado !== 'RESUELTA') {
      throw ApiError.badRequest('Solo se pueden cerrar alertas resueltas');
    }

    const lotesAfectados = alert.lotesAfectados as string[];

    if (lotesAfectados.length > 0) {
      await this.lotService.unblockLots(lotesAfectados, userId);
    }

    const updated = await this.alertRepository.update(alertId, {
      estado: 'CERRADA',
      fechaCierre: new Date(),
    });

    appEvents.emitEvent(EVENT_TYPES.ALERT_CLOSED, {
      id: alertId,
      codigo: alert.codigo,
      cantidadRetirada: alert.cantidadRetirada,
      cantidadRecuperada: alert.cantidadRecuperada,
      porcentajeRecuperacion: alert.porcentajeRecuperacion,
    });

    return updated;
  }

  async update(id: string, data: UpdateAlertDTO, userId: string) {
    const alert = await this.findById(id);

    const updateData: any = {};

    if (data.estado) updateData.estado = data.estado;
    if (data.resolucion) updateData.resolucion = data.resolucion;
    if (data.resueltaPor) updateData.resueltaPor = data.resueltaPor;

    const updated = await this.alertRepository.update(id, updateData);

    return updated;
  }

  async getActiveAlerts() {
    return this.alertRepository.getActiveAlerts();
  }

  async updateRecoveryStats(alertId: string, stats: {
    cantidadRetirada?: number;
    cantidadRecuperada?: number;
  }) {
    const alert = await this.findById(alertId);

    const updateData: any = {};

    if (stats.cantidadRetirada !== undefined) {
      updateData.cantidadRetirada = (alert.cantidadRetirada || 0) + stats.cantidadRetirada;
    }

    if (stats.cantidadRecuperada !== undefined) {
      updateData.cantidadRecuperada = (alert.cantidadRecuperada || 0) + stats.cantidadRecuperada;
    }

    if (updateData.cantidadRetirada !== undefined || updateData.cantidadRecuperada !== undefined) {
      const retirada = updateData.cantidadRetirada || alert.cantidadRetirada || 0;
      const recuperada = updateData.cantidadRecuperada || alert.cantidadRecuperada || 0;

      if (retirada > 0) {
        updateData.porcentajeRecuperacion = Math.round((recuperada / retirada) * 100 * 100) / 100;
      }
    }

    return this.alertRepository.update(alertId, updateData);
  }

  private async findRelatedRawMaterials(loteId: string): Promise<string[]> {
    const rawMaterialIds: string[] = [];
    const visited = new Set<string>();

    const findRawMaterials = async (currentLoteId: string) => {
      if (visited.has(currentLoteId)) return;
      visited.add(currentLoteId);

      const produccion = await prisma.produccion.findUnique({
        where: { loteId: currentLoteId },
        include: {
          materiasPrimas: {
            select: { loteId: true },
          },
        },
      });

      if (produccion) {
        for (const mp of produccion.materiasPrimas) {
          rawMaterialIds.push(mp.loteId);
          await findRawMaterials(mp.loteId);
        }
      }
    };

    await findRawMaterials(loteId);
    return rawMaterialIds;
  }
}