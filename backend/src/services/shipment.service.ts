import { ShipmentRepository } from '@repositories/shipment.repository';
import { LotService } from '@services/lot.service';
import { ApiError } from '@utils/errors';
import { generateShipmentCode } from '@utils/lotGenerator';
import { appEvents, EVENT_TYPES } from '@events/eventEmitter';
import { prisma } from '@config/database';
import { getPaginationParams, getPaginationMeta } from '@utils/pagination';
import { addEmailToQueue } from '@queues/email.queue';

export class ShipmentService {
  private shipmentRepository: ShipmentRepository;
  private lotService: LotService;

  constructor() {
    this.shipmentRepository = new ShipmentRepository();
    this.lotService = new LotService();
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    clienteId?: string;
    estado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    codigo?: string;
  }) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: any = {};

    if (query.clienteId) where.clienteId = query.clienteId;
    if (query.estado) where.estado = query.estado;
    if (query.codigo) where.codigo = { contains: query.codigo, mode: 'insensitive' };
    if (query.fechaDesde || query.fechaHasta) {
      where.fechaEnvio = {};
      if (query.fechaDesde) where.fechaEnvio.gte = new Date(query.fechaDesde);
      if (query.fechaHasta) where.fechaEnvio.lte = new Date(query.fechaHasta);
    }

    const { shipments, total } = await this.shipmentRepository.findAll({
      skip,
      take,
      where,
    });

    return {
      data: shipments,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string) {
    const shipment = await this.shipmentRepository.findById(id);

    if (!shipment) {
      throw ApiError.notFound('Expedición no encontrada');
    }

    return shipment;
  }

  async create(data: {
    clienteId: string;
    items: { loteId: string; cantidad: number; precioUnitario?: number }[];
    empresaTransporte?: string;
    matriculaVehiculo?: string;
    nombreConductor?: string;
    fechaPrevistaEntrega?: string;
    observaciones?: string;
  }, userId: string) {
    const cliente = await prisma.cliente.findUnique({ where: { id: data.clienteId } });

    if (!cliente) {
      throw ApiError.notFound('Cliente no encontrado');
    }

    if (!data.items || data.items.length === 0) {
      throw ApiError.badRequest('Debe incluir al menos un lote en la expedición');
    }

    const lotesParaExpedir = [] as Array<{
      lote: Awaited<ReturnType<LotService['findById']>>;
      cantidad: number;
      precioUnitario?: number;
    }>;

    for (const item of data.items) {
      const lote = await this.lotService.findById(item.loteId);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (lote.fechaCaducidad) {
        const fechaCaducidad = new Date(lote.fechaCaducidad);
        fechaCaducidad.setHours(0, 0, 0, 0);

        if (fechaCaducidad < today) {
          throw ApiError.badRequest(`El lote ${lote.codigo} está caducado y no puede ser expedido`);
        }
      }

      if (lote.estado === 'VENCIDO') {
        throw ApiError.badRequest(`El lote ${lote.codigo} está vencido y no puede ser expedido`);
      }

      if (lote.estado === 'BLOQUEADO') {
        throw ApiError.badRequest(
          `El lote ${lote.codigo} está bloqueado por alerta sanitaria y no puede ser expedido`
        );
      }

      if (lote.estado === 'RETIRADO') {
        throw ApiError.badRequest(`El lote ${lote.codigo} ha sido retirado y no puede ser expedido`);
      }

      if (item.cantidad > lote.cantidad) {
        throw ApiError.badRequest(
          `Stock insuficiente en lote ${lote.codigo}. Disponible: ${lote.cantidad}`
        );
      }

      const alertaActiva = await prisma.alerta.count({
        where: {
          loteId: lote.id,
          estado: { in: ['ABIERTA', 'INVESTIGANDO'] },
        },
      });

      if (alertaActiva > 0) {
        throw ApiError.badRequest(
          `El lote ${lote.codigo} tiene una alerta sanitaria activa y no puede ser expedido`
        );
      }

      lotesParaExpedir.push({ lote, cantidad: item.cantidad, precioUnitario: item.precioUnitario });
    }

    const codigo = await generateShipmentCode();

    const shipment = await prisma.$transaction(async (tx) => {
      const createdShipment = await tx.expedicion.create({
        data: {
          codigo,
          cliente: { connect: { id: data.clienteId } },
          estado: 'PREPARANDO',
          empresaTransporte: data.empresaTransporte,
          matriculaVehiculo: data.matriculaVehiculo,
          nombreConductor: data.nombreConductor,
          fechaPrevistaEntrega: data.fechaPrevistaEntrega ? new Date(data.fechaPrevistaEntrega) : undefined,
          preparador: { connect: { id: userId } },
          observaciones: data.observaciones,
        },
      });

      for (const { lote, cantidad, precioUnitario } of lotesParaExpedir) {
        await tx.itemExpedicion.create({
          data: {
            expedicionId: createdShipment.id,
            loteId: lote.id,
            cantidad,
            unidadMedida: lote.unidadMedida,
            precioUnitario,
            precioTotal: precioUnitario ? precioUnitario * cantidad : undefined,
          },
        });

        await tx.lote.update({
          where: { id: lote.id },
          data: {
            cantidad: { decrement: cantidad },
            estado: lote.cantidad - cantidad <= 0 ? 'ENTREGADO' : undefined,
          },
        });

        await tx.movimientoLote.create({
          data: {
            loteId: lote.id,
            tipo: 'EXPEDICION',
            ubicacionOrigenId: lote.ubicacionId,
            cantidad,
            unidadMedida: lote.unidadMedida,
            referenciaId: createdShipment.id,
            referenciaTipo: 'EXPEDICION',
            realizadoPor: userId,
            observaciones: `Expedición ${codigo} a ${cliente.nombre}`,
          },
        });
      }

      return createdShipment;
    });

    appEvents.emitEvent(EVENT_TYPES.SHIPMENT_CREATED, {
      shipmentId: shipment.id,
      codigo,
      clienteId: data.clienteId,
      cliente: cliente.nombre,
      cantidadItems: data.items.length,
      creadaPor: userId,
    });

    if (cliente.emailContacto) {
      try {
        await addEmailToQueue({
          to: cliente.emailContacto,
          subject: `Expedición ${codigo} - En preparación`,
          html: `
            <h2>Expedición en preparación</h2>
            <p>Estimado ${cliente.nombreContacto},</p>
            <p>Le informamos que la expedición <strong>${codigo}</strong> está siendo preparada.</p>
            <p>Número de items: ${data.items.length}</p>
            <p>Puede consultar el estado en el portal de trazabilidad.</p>
          `,
        });
      } catch (error) {
        console.error('Error enviando email de notificación:', error);
      }
    }

    return this.findById(shipment.id);
  }

  async updateStatus(id: string, estado: string, userId: string) {
    const shipment = await this.findById(id);

    const validTransitions: Record<string, string[]> = {
      'PREPARANDO': ['EN_TRANSITO', 'CANCELADO'],
      'EN_TRANSITO': ['ENTREGADO', 'CANCELADO'],
      'ENTREGADO': [],
      'CANCELADO': [],
      'DEVUELTO': [],
    };

    const currentStatus = shipment.estado;
    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(estado)) {
      throw ApiError.badRequest(
        `No se puede cambiar el estado de ${currentStatus} a ${estado}`
      );
    }

    const updated = await this.shipmentRepository.update(id, {
      estado: estado as any,
      ...(estado === 'EN_TRANSITO' && { fechaEnvio: new Date() }),
      ...(estado === 'ENTREGADO' && { fechaEntrega: new Date() }),
    });

    if (estado === 'EN_TRANSITO') {
      appEvents.emitEvent(EVENT_TYPES.SHIPMENT_DISPATCHED, {
        shipmentId: id,
        codigo: shipment.codigo,
        fechaEnvio: new Date(),
        despachadaPor: userId,
      });
    }

    if (estado === 'ENTREGADO') {
      appEvents.emitEvent(EVENT_TYPES.SHIPMENT_DELIVERED, {
        shipmentId: id,
        codigo: shipment.codigo,
        fechaEntrega: new Date(),
        entregadaPor: userId,
      });
    }

    if (estado === 'CANCELADO') {
      appEvents.emitEvent(EVENT_TYPES.SHIPMENT_CANCELLED, {
        shipmentId: id,
        codigo: shipment.codigo,
        canceladaPor: userId,
      });
    }

    return updated;
  }

  async getRecentShipments(limit: number = 5) {
    return this.shipmentRepository.getRecentShipments(limit);
  }

  async getShipmentsByClient(clienteId: string) {
    return this.shipmentRepository.getShipmentsByClient(clienteId);
  }
}