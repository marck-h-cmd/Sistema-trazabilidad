import { LotRepository } from '@repositories/lot.repository';
import { ApiError } from '@utils/errors';
import { CreateLotDTO, UpdateLotDTO, LotQueryParams } from '@customTypes/lot.types';
import { getPaginationParams, getPaginationMeta } from '@utils/pagination';
import { generateLotCode } from '@utils/lotGenerator';
import { appEvents, EVENT_TYPES } from '@appEvents/eventEmitter';
import { Prisma, EstadoLote } from '@prisma/client';
import { calculateExpiryDateFromNow } from '@utils/dateUtils';

export class LotService {
  private lotRepository: LotRepository;

  constructor() {
    this.lotRepository = new LotRepository();
  }

  async findAll(query: LotQueryParams) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: Prisma.LoteWhereInput = {};

    if (query.productoId) where.productoId = query.productoId;
    if (query.estado) where.estado = query.estado as EstadoLote;
    if (query.codigo) where.codigo = { contains: query.codigo, mode: 'insensitive' };
    if (query.ubicacionId) where.ubicacionId = query.ubicacionId;

    if (query.fechaCaducidadDesde || query.fechaCaducidadHasta) {
      where.fechaCaducidad = {};
      if (query.fechaCaducidadDesde) where.fechaCaducidad.gte = new Date(query.fechaCaducidadDesde);
      if (query.fechaCaducidadHasta) where.fechaCaducidad.lte = new Date(query.fechaCaducidadHasta);
    }

    if (query.search) {
      where.OR = [
        { codigo: { contains: query.search, mode: 'insensitive' } },
        { producto: { nombre: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const { lots, total } = await this.lotRepository.findAll({ skip, take, where });

    return {
      data: lots,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string) {
    const lot = await this.lotRepository.findById(id);

    if (!lot) {
      throw ApiError.notFound('Lote no encontrado');
    }

    return lot;
  }

  async findByCode(codigo: string) {
    const lot = await this.lotRepository.findByCode(codigo);

    if (!lot) {
      throw ApiError.notFound('Lote no encontrado');
    }

    return lot;
  }

  async create(data: CreateLotDTO, userId: string) {
    const producto = await this.verifyProduct(data.productoId);

    let codigo: string;
    if (data.codigo) {
      const existing = await this.lotRepository.findByCode(data.codigo);
      if (existing) throw ApiError.conflict('Ya existe un lote con ese código');
      codigo = data.codigo;
    } else {
      codigo = await generateLotCode();
    }

    let fechaCaducidad = data.fechaCaducidad || undefined;
    if (!fechaCaducidad && data.fechaProduccion) {
      fechaCaducidad = calculateExpiryDateFromNow(producto.vidaUtilDias);
    }

    const lot = await this.lotRepository.create({
      codigo,
      producto: { connect: { id: data.productoId } },
      cantidad: data.cantidad,
      cantidadInicial: data.cantidad,
      unidadMedida: data.unidadMedida || producto.unidadMedida,
      fechaProduccion: data.fechaProduccion || new Date(),
      fechaCaducidad,
      fechaRecepcion: data.fechaRecepcion || new Date(),
      ubicacion: data.ubicacionId ? { connect: { id: data.ubicacionId } } : undefined,
      almacen: data.almacenId ? { connect: { id: data.almacenId } } : undefined,
      lotePadre: data.lotePadreId ? { connect: { id: data.lotePadreId } } : undefined,
      recepcion: data.recepcionId ? { connect: { id: data.recepcionId } } : undefined,
      numeroLoteProveedor: data.numeroLoteProveedor,
      observaciones: data.observaciones,
      creador: { connect: { id: userId } },
    });

    appEvents.emitEvent(EVENT_TYPES.LOT_CREATED, {
      loteId: lot.id,
      codigo: lot.codigo,
      productoId: lot.productoId,
      cantidad: lot.cantidad,
      creadoPor: userId,
    });

    return lot;
  }

  async update(id: string, data: UpdateLotDTO, userId: string) {
    const lot = await this.findById(id);

    const estadoAnterior = lot.estado;

    const updated = await this.lotRepository.update(id, {
      ...data,
      actualizadoPor: userId,
    });

    if (data.estado && data.estado !== estadoAnterior) {
      appEvents.emitEvent(EVENT_TYPES.LOT_STATUS_CHANGED, {
        loteId: lot.id,
        estadoAnterior,
        estadoNuevo: data.estado,
        cambiadoPor: userId,
      });
    }

    return updated;
  }

  async updateStatus(id: string, estado: EstadoLote, userId: string) {
    const lot = await this.findById(id);
    const estadoAnterior = lot.estado;

    const updated = await this.lotRepository.updateStatus(id, estado);

    appEvents.emitEvent(EVENT_TYPES.LOT_STATUS_CHANGED, {
      loteId: lot.id,
      estadoAnterior,
      estadoNuevo: estado,
      cambiadoPor: userId,
    });

    return updated;
  }

  async getExpiringLotes(dias: number = 7) {
    return this.lotRepository.getExpiringLotes(dias);
  }

  async blockLots(loteIds: string[], userId: string) {
    const result = await this.lotRepository.bulkUpdateStatus(loteIds, 'BLOQUEADO');

    for (const loteId of loteIds) {
      appEvents.emitEvent(EVENT_TYPES.LOT_BLOCKED, {
        loteId,
        bloqueadoPor: userId,
        motivo: 'Alerta sanitaria',
      });
    }

    return result;
  }

  async unblockLots(loteIds: string[], userId: string) {
    const result = await this.lotRepository.bulkUpdateStatus(loteIds, 'ACTIVO');

    for (const loteId of loteIds) {
      appEvents.emitEvent(EVENT_TYPES.LOT_UNBLOCKED, {
        loteId,
        desbloqueadoPor: userId,
      });
    }

    return result;
  }

  private async verifyProduct(productoId: string) {
    const { prisma } = require('@config/database');
    const producto = await prisma.producto.findUnique({ where: { id: productoId } });
    if (!producto) throw ApiError.notFound('Producto no encontrado');
    if (!producto.activo) throw ApiError.badRequest('El producto está inactivo');
    return producto;
  }
}
