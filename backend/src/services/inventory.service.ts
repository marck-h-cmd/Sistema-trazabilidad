import { MovementRepository } from '@repositories/movement.repository';
import { LotService } from '@services/lot.service';
import { ApiError } from '@utils/errors';
import { appEvents, EVENT_TYPES } from '@appEvents/eventEmitter';
import { prisma } from '@config/database';
import { getPaginationParams, getPaginationMeta } from '@utils/pagination';
import { getFifoSuggestions, validateFifoOrder } from '@utils/fifo';

export class InventoryService {
  private movementRepository: MovementRepository;
  private lotService: LotService;

  constructor() {
    this.movementRepository = new MovementRepository();
    this.lotService = new LotService();
  }

  async getMovements(query: {
    page?: number;
    limit?: number;
    loteId?: string;
    tipo?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: any = {};

    if (query.loteId) where.loteId = query.loteId;
    if (query.tipo) where.tipo = query.tipo;
    if (query.fechaDesde || query.fechaHasta) {
      where.creadoEn = {};
      if (query.fechaDesde) where.creadoEn.gte = new Date(query.fechaDesde);
      if (query.fechaHasta) where.creadoEn.lte = new Date(query.fechaHasta);
    }

    const { movements, total } = await this.movementRepository.findAll({
      skip,
      take,
      where,
    });

    return {
      data: movements,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async getMovementsByLot(lotId: string) {
    await this.lotService.findById(lotId);
    return this.movementRepository.findByLotId(lotId);
  }

  async moveLot(data: {
    loteId: string;
    ubicacionOrigenId?: string;
    ubicacionDestinoId: string;
    cantidad: number;
    observaciones?: string;
  }, userId: string) {
    const lote = await this.lotService.findById(data.loteId);

    if (lote.estado === 'VENCIDO') {
      throw ApiError.badRequest('No se puede mover un lote vencido');
    }

    if (lote.estado === 'BLOQUEADO') {
      throw ApiError.badRequest('No se puede mover un lote bloqueado por alerta sanitaria');
    }

    if (data.cantidad > lote.cantidad) {
      throw ApiError.badRequest(
        `Cantidad a mover (${data.cantidad}) excede el stock disponible (${lote.cantidad})`
      );
    }

    const ubicacionDestino = await prisma.ubicacion.findUnique({
      where: { id: data.ubicacionDestinoId },
    });

    if (!ubicacionDestino) {
      throw ApiError.notFound('Ubicación destino no encontrada');
    }

    if (ubicacionDestino.capacidadMaxima) {
      const nuevaCapacidad = ubicacionDestino.capacidadActual + data.cantidad;
      if (nuevaCapacidad > ubicacionDestino.capacidadMaxima) {
        throw ApiError.badRequest('La ubicación destino no tiene capacidad suficiente');
      }
    }

    const movement = await this.movementRepository.create({
      lote: { connect: { id: data.loteId } },
      tipo: 'MOVIMIENTO_INTERNO',
      ubicacionOrigen: data.ubicacionOrigenId
        ? { connect: { id: data.ubicacionOrigenId } }
        : lote.ubicacionId
        ? { connect: { id: lote.ubicacionId } }
        : undefined,
      ubicacionDestino: { connect: { id: data.ubicacionDestinoId } },
      cantidad: data.cantidad,
      unidadMedida: lote.unidadMedida,
      usuario: { connect: { id: userId } },
      observaciones: data.observaciones,
    });

    await prisma.lote.update({
      where: { id: data.loteId },
      data: { ubicacionId: data.ubicacionDestinoId },
    });

    if (ubicacionDestino.capacidadMaxima) {
      await prisma.ubicacion.update({
        where: { id: data.ubicacionDestinoId },
        data: { capacidadActual: { increment: data.cantidad } },
      });
    }

    if (data.ubicacionOrigenId || lote.ubicacionId) {
      const origenId = data.ubicacionOrigenId || lote.ubicacionId;
      if (origenId) {
        await prisma.ubicacion.update({
          where: { id: origenId },
          data: { capacidadActual: { decrement: data.cantidad } },
        });
      }
    }

    appEvents.emitEvent(EVENT_TYPES.LOT_MOVED, {
      movimientoId: movement.id,
      loteId: data.loteId,
      origen: data.ubicacionOrigenId || lote.ubicacionId,
      destino: data.ubicacionDestinoId,
      cantidad: data.cantidad,
      movidoPor: userId,
    });

    return movement;
  }

  async getStockByLot(lotId: string) {
    const lote = await this.lotService.findById(lotId);
    return {
      loteId: lote.id,
      codigo: lote.codigo,
      producto: lote.producto?.nombre,
      cantidad: lote.cantidad,
      unidad: lote.unidadMedida,
      estado: lote.estado,
      ubicacion: lote.ubicacion?.codigoCompleto || 'Sin ubicación',
      almacen: lote.almacen?.nombre || 'Sin almacén',
      fechaCaducidad: lote.fechaCaducidad,
    };
  }

  async getStockByLocation(locationId: string) {
    const ubicacion = await prisma.ubicacion.findUnique({
      where: { id: locationId },
      include: {
        almacen: { select: { nombre: true } },
      },
    });

    if (!ubicacion) {
      throw ApiError.notFound('Ubicación no encontrada');
    }

    const lotes = await prisma.lote.findMany({
      where: {
        ubicacionId: locationId,
        estado: { in: ['ACTIVO', 'RESERVADO'] },
        cantidad: { gt: 0 },
      },
      include: {
        producto: { select: { nombre: true, sku: true } },
      },
      orderBy: { fechaCaducidad: 'asc' },
    });

    return {
      ubicacion: ubicacion.codigoCompleto,
      almacen: ubicacion.almacen.nombre,
      capacidadMaxima: ubicacion.capacidadMaxima,
      capacidadActual: ubicacion.capacidadActual,
      lotes,
      totalLotes: lotes.length,
      cantidadTotal: lotes.reduce((sum, l) => sum + l.cantidad, 0),
    };
  }

  async getExpiringSoon(dias: number = 7) {
    const lotes = await this.lotService.getExpiringLotes(dias);
    return lotes;
  }

  async getFifoSuggestions(productoId: string, cantidadNecesaria: number) {
    return getFifoSuggestions(productoId, cantidadNecesaria);
  }

  async validateFifoSelection(lotesSeleccionados: { loteId: string; cantidad: number }[]) {
    return validateFifoOrder(lotesSeleccionados);
  }

  async getRecentMovements(limit: number = 10) {
    return this.movementRepository.getRecentMovements(limit);
  }
}