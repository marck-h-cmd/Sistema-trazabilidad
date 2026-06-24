import { ReceptionRepository } from '@repositories/reception.repository';
import { LotService } from '@services/lot.service';
import { ApiError } from '@utils/errors';
import { generateReceptionCode } from '@utils/lotGenerator';
import { appEvents, EVENT_TYPES } from '@appEvents/eventEmitter';
import { prisma } from '@config/database';
import { getPaginationParams, getPaginationMeta } from '@utils/pagination';

export class ReceptionService {
  private receptionRepository: ReceptionRepository;
  private lotService: LotService;

  constructor() {
    this.receptionRepository = new ReceptionRepository();
    this.lotService = new LotService();
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    proveedorId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    estado?: string;
  }) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: any = {};

    if (query.proveedorId) where.proveedorId = query.proveedorId;
    if (query.estado) where.estado = query.estado;
    if (query.fechaDesde || query.fechaHasta) {
      where.fechaRecepcion = {};
      if (query.fechaDesde) where.fechaRecepcion.gte = new Date(query.fechaDesde);
      if (query.fechaHasta) where.fechaRecepcion.lte = new Date(query.fechaHasta);
    }

    const { receptions, total } = await this.receptionRepository.findAll({
      skip,
      take,
      where,
    });

    return {
      data: receptions,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string) {
    const reception = await this.receptionRepository.findById(id);

    if (!reception) {
      throw ApiError.notFound('Recepción no encontrada');
    }

    return reception;
  }

  async create(
    data: {
      proveedorId: string;
      metodoEntrada?: string;
      numeroAlbaran?: string;
      numeroFactura?: string;
      lotes: {
        productoId: string;
        cantidad: number;
        unidadMedida: string;
        fechaCaducidad?: string;
        ubicacionId?: string;
        numeroLoteProveedor?: string;
        temperaturaLlegada?: number;
      }[];
      observaciones?: string;
    },
    userId: string
  ) {
    const proveedor = await prisma.proveedor.findUnique({ where: { id: data.proveedorId } });

    if (!proveedor) {
      throw ApiError.notFound('Proveedor no encontrado');
    }

    const codigo = await generateReceptionCode();

    // Asignar automáticamente almacén y ubicación disponible
    const defaultWarehouse = await prisma.almacen.findFirst({
      where: { activo: true },
      orderBy: { creadoEn: 'asc' },
    });

    let defaultLocation: { id: string; capacidadMaxima: number | null; capacidadActual: number } | null = null;

    if (defaultWarehouse) {
      defaultLocation = await prisma.ubicacion.findFirst({
        where: {
          almacenId: defaultWarehouse.id,
          activo: true,
          OR: [
            { capacidadMaxima: null },
            {
              capacidadMaxima: { not: null },
            },
          ],
        },
        orderBy: { capacidadActual: 'asc' },
      });
    }

    const reception = await this.receptionRepository.create({
      codigo,
      proveedor: { connect: { id: data.proveedorId } },
      metodoEntrada: data.metodoEntrada || 'MANUAL',
      numeroAlbaran: data.numeroAlbaran,
      numeroFactura: data.numeroFactura,
      receptor: { connect: { id: userId } },
      observaciones: data.observaciones,
    });

    for (const loteData of data.lotes) {
      const ubicacionId = loteData.ubicacionId || defaultLocation?.id;
      const almacenId = defaultWarehouse?.id;

      const lote = await this.lotService.create(
        {
          productoId: loteData.productoId,
          cantidad: loteData.cantidad,
          unidadMedida: loteData.unidadMedida,
          fechaRecepcion: new Date(),
          fechaCaducidad: loteData.fechaCaducidad ? new Date(loteData.fechaCaducidad) : undefined,
          ubicacionId,
          almacenId,
          numeroLoteProveedor: loteData.numeroLoteProveedor,
          recepcionId: reception.id,
        },
        userId
      );

      // Actualizar capacidad ocupada de la ubicación
      if (ubicacionId && defaultLocation && defaultLocation.capacidadMaxima) {
        await prisma.ubicacion.update({
          where: { id: ubicacionId },
          data: { capacidadActual: { increment: loteData.cantidad } },
        });
      }

      await prisma.materiaPrima.create({
        data: {
          loteId: lote.id,
          proveedorId: data.proveedorId,
          codigoLoteProveedor: loteData.numeroLoteProveedor,
          numeroAlbaran: data.numeroAlbaran,
          numeroFactura: data.numeroFactura,
          cantidad: loteData.cantidad,
          unidadMedida: loteData.unidadMedida,
          fechaRecepcion: new Date(),
          fechaCaducidad: loteData.fechaCaducidad ? new Date(loteData.fechaCaducidad) : undefined,
          temperaturaLlegada: loteData.temperaturaLlegada,
          creadoPor: userId,
        },
      });

      await prisma.movimientoLote.create({
        data: {
          loteId: lote.id,
          tipo: 'RECEPCION',
          ubicacionDestinoId: loteData.ubicacionId,
          cantidad: loteData.cantidad,
          unidadMedida: loteData.unidadMedida,
          referenciaId: reception.id,
          referenciaTipo: 'RECEPCION',
          realizadoPor: userId,
          observaciones: `Recepción ${codigo}`,
        },
      });
    }

    appEvents.emitEvent(EVENT_TYPES.RECEPTION_COMPLETED, {
      receptionId: reception.id,
      codigo,
      proveedorId: data.proveedorId,
      cantidadLotes: data.lotes.length,
      recibidoPor: userId,
    });

    return this.findById(reception.id);
  }

  async processScannedBarcode(barcode: string) {
    const supplier = await prisma.proveedor.findFirst({
      where: { utilizaCodigoBarras: true },
    });

    if (!supplier) {
      throw ApiError.notFound('No se encontró proveedor para el código escaneado');
    }

    return {
      proveedor: {
        id: supplier.id,
        nombre: supplier.nombre,
        codigo: supplier.codigo,
      },
      codigoBarras: barcode,
      mensaje: 'Proveedor identificado. Complete los datos del producto.',
    };
  }

  async getRecentReceptions(limit: number = 5) {
    return this.receptionRepository.getRecentReceptions(limit);
  }
}
