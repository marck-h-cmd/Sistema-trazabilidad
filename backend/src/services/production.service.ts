import { ProductionRepository } from '@repositories/production.repository';
import { LotService } from '@services/lot.service';
import { ApiError } from '@utils/errors';
import { generateLotCode } from '@utils/lotGenerator';
import { appEvents, EVENT_TYPES } from '@appEvents/eventEmitter';
import { prisma } from '@config/database';
import { getPaginationParams, getPaginationMeta } from '@utils/pagination';
import { calculateExpiryDateFromNow } from '@utils/dateUtils';

export class ProductionService {
  private productionRepository: ProductionRepository;
  private lotService: LotService;

  constructor() {
    this.productionRepository = new ProductionRepository();
    this.lotService = new LotService();
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    lineaProduccionId?: string;
    productoId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: any = {};

    if (query.lineaProduccionId) where.lineaProduccionId = query.lineaProduccionId;
    if (query.fechaDesde || query.fechaHasta) {
      where.fechaInicio = {};
      if (query.fechaDesde) where.fechaInicio.gte = new Date(query.fechaDesde);
      if (query.fechaHasta) where.fechaInicio.lte = new Date(query.fechaHasta);
    }

    const { productions, total } = await this.productionRepository.findAll({
      skip,
      take,
      where,
    });

    return {
      data: productions,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string) {
    const production = await this.productionRepository.findById(id);

    if (!production) {
      throw ApiError.notFound('Producción no encontrada');
    }

    return production;
  }

  async create(data: {
    lineaProduccionId: string;
    productoId: string;
    materiasPrimas: { loteId: string; cantidad: number }[];
    temperaturaHorno?: number;
    tiempoCoccion?: number;
    humedad?: number;
    tamanoLote?: number;
    observaciones?: string;
    tipoEtiqueta?: string;
    cantidadEtiquetas?: number;
  }, userId: string) {
    const lineaProduccion = await prisma.lineaProduccion.findUnique({
      where: { id: data.lineaProduccionId },
    });

    if (!lineaProduccion) {
      throw ApiError.notFound('Línea de producción no encontrada');
    }

    const producto = await prisma.producto.findUnique({
      where: { id: data.productoId },
    });

    if (!producto) {
      throw ApiError.notFound('Producto no encontrado');
    }

    for (const mp of data.materiasPrimas) {
      const lote = await prisma.lote.findUnique({ where: { id: mp.loteId } });

      if (!lote) {
        throw ApiError.notFound(`Lote ${mp.loteId} no encontrado`);
      }

      if (lote.estado === 'VENCIDO') {
        throw ApiError.badRequest(`El lote ${lote.codigo} está vencido`);
      }

      if (lote.estado === 'BLOQUEADO') {
        throw ApiError.badRequest(`El lote ${lote.codigo} está bloqueado`);
      }

      if (lote.cantidad < mp.cantidad) {
        throw ApiError.badRequest(
          `Stock insuficiente en lote ${lote.codigo}. Disponible: ${lote.cantidad}`
        );
      }
    }

    const codigoLote = await generateLotCode(lineaProduccion.codigo, producto.configuracionLote as any);

    const fechaCaducidad = calculateExpiryDateFromNow(producto.vidaUtilDias);

    const lote = await this.lotService.create({
      productoId: data.productoId,
      codigo: codigoLote,
      cantidad: data.tamanoLote || 1,
      unidadMedida: producto.unidadMedida,
      fechaProduccion: new Date(),
      fechaCaducidad,
      observaciones: data.observaciones,
    }, userId);

    const totalMateriasPrimas = data.materiasPrimas.reduce((sum, mp) => sum + mp.cantidad, 0);
    const rendimiento = data.tamanoLote ? ((data.tamanoLote || 1) / totalMateriasPrimas) * 100 : undefined;

    const production = await this.productionRepository.create({
      lote: { connect: { id: lote.id } },
      lineaProduccion: { connect: { id: data.lineaProduccionId } },
      temperaturaHorno: data.temperaturaHorno,
      tiempoCoccion: data.tiempoCoccion,
      humedad: data.humedad,
      tamanoLote: data.tamanoLote,
      rendimiento,
      operario: { connect: { id: userId } },
      fechaInicio: new Date(),
      fechaFin: new Date(),
      etiquetasImpresas: false,
      tipoEtiqueta: (data.tipoEtiqueta as any) || 'AMBOS',
      cantidadEtiquetas: data.cantidadEtiquetas || 0,
      observaciones: data.observaciones,
      creadoPor: userId,
    });

    for (const mp of data.materiasPrimas) {
      const loteMP = await prisma.lote.findUnique({ where: { id: mp.loteId } });

      await prisma.lote.update({
        where: { id: mp.loteId },
        data: { cantidad: { decrement: mp.cantidad } },
      });

      await prisma.materiaPrima.updateMany({
        where: { loteId: mp.loteId },
        data: { produccionId: production.id },
      });

      await prisma.movimientoLote.create({
        data: {
          loteId: mp.loteId,
          tipo: 'CONSUMO',
          cantidad: mp.cantidad,
          unidadMedida: loteMP?.unidadMedida || 'kg',
          referenciaId: production.id,
          referenciaTipo: 'PRODUCCION',
          realizadoPor: userId,
          observaciones: `Consumido en producción de lote ${codigoLote}`,
        },
      });

      if (loteMP && loteMP.cantidad - mp.cantidad <= 0) {
        await prisma.lote.update({
          where: { id: mp.loteId },
          data: { estado: 'CONSUMIDO' },
        });

        appEvents.emitEvent(EVENT_TYPES.LOT_CONSUMED, {
          loteId: mp.loteId,
          cantidad: mp.cantidad,
          produccionId: production.id,
          consumidoPor: userId,
        });
      }
    }

    await prisma.movimientoLote.create({
      data: {
        loteId: lote.id,
        tipo: 'PRODUCCION',
        cantidad: lote.cantidad,
        unidadMedida: lote.unidadMedida,
        referenciaId: production.id,
        referenciaTipo: 'PRODUCCION',
        realizadoPor: userId,
        observaciones: `Producción de lote ${codigoLote}`,
      },
    });

    appEvents.emitEvent(EVENT_TYPES.PRODUCTION_COMPLETED, {
      productionId: production.id,
      loteId: lote.id,
      codigoLote,
      lineaProduccionId: data.lineaProduccionId,
      productoId: data.productoId,
      completadoPor: userId,
    });

    return this.findById(production.id);
  }

  async update(id: string, data: {
    temperaturaHorno?: number;
    tiempoCoccion?: number;
    humedad?: number;
    etiquetasImpresas?: boolean;
    observaciones?: string;
  }, userId: string) {
    await this.findById(id);

    return this.productionRepository.update(id, data);
  }

  async getRecentProductions(limit: number = 5) {
    return this.productionRepository.getRecentProductions(limit);
  }
}