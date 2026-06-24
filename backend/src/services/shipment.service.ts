import { ShipmentRepository } from '@repositories/shipment.repository';
import { LotService } from '@services/lot.service';
import { ApiError } from '@utils/errors';
import { generateShipmentCode } from '@utils/lotGenerator';
import { appEvents, EVENT_TYPES } from '@appEvents/eventEmitter';
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

    for (const item of data.items) {
      const lote = await this.lotService.findById(item.loteId);

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
    }

    const codigo = await generateShipmentCode();

    const shipment = await this.shipmentRepository.create({
      codigo,
      cliente: { connect: { id: data.clienteId } },
      estado: 'PREPARANDO',
      empresaTransporte: data.empresaTransporte,
      matriculaVehiculo: data.matriculaVehiculo,
      nombreConductor: data.nombreConductor,
      fechaPrevistaEntrega: data.fechaPrevistaEntrega ? new Date(data.fechaPrevistaEntrega) : undefined,
      preparador: { connect: { id: userId } },
      observaciones: data.observaciones,
    });

    for (const item of data.items) {
      const lote = await this.lotService.findById(item.loteId);

      await prisma.itemExpedicion.create({
        data: {
          expedicionId: shipment.id,
          loteId: item.loteId,
          cantidad: item.cantidad,
          unidadMedida: lote.unidadMedida,
          precioUnitario: item.precioUnitario,
          precioTotal: item.precioUnitario ? item.precioUnitario * item.cantidad : undefined,
        },
      });

      await prisma.lote.update({
        where: { id: item.loteId },
        data: {
          cantidad: { decrement: item.cantidad },
          estado: lote.cantidad - item.cantidad <= 0 ? 'ENTREGADO' : undefined,
        },
      });

      await prisma.movimientoLote.create({
        data: {
          loteId: item.loteId,
          tipo: 'EXPEDICION',
          ubicacionOrigenId: lote.ubicacionId,
          cantidad: item.cantidad,
          unidadMedida: lote.unidadMedida,
          referenciaId: shipment.id,
          referenciaTipo: 'EXPEDICION',
          realizadoPor: userId,
          observaciones: `Expedición ${codigo} a ${cliente.nombre}`,
        },
      });
    }

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