import { prisma } from '@config/database';
import { Prisma, EstadoExpedicion } from '@prisma/client';

export class ShipmentRepository {
  async findAll(params: {
    skip: number;
    take: number;
    where?: Prisma.ExpedicionWhereInput;
    orderBy?: Prisma.ExpedicionOrderByWithRelationInput;
  }) {
    const [shipments, total] = await Promise.all([
      prisma.expedicion.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy || { creadoEn: 'desc' },
        include: {
          cliente: {
            select: { id: true, nombre: true, codigo: true },
          },
          preparador: {
            select: { id: true, nombre: true, apellido: true },
          },
          items: {
            include: {
              lote: {
                select: { id: true, codigo: true, producto: { select: { nombre: true } } },
              },
            },
          },
        },
      }),
      prisma.expedicion.count({ where: params.where }),
    ]);
    return { shipments, total };
  }

  async findById(id: string) {
    return prisma.expedicion.findUnique({
      where: { id },
      include: {
        cliente: true,
        preparador: { select: { id: true, nombre: true, apellido: true } },
        items: {
          include: {
            lote: {
              include: {
                producto: true,
              },
            },
          },
        },
        documentos: true,
      },
    });
  }

  async findByCode(codigo: string) {
    return prisma.expedicion.findUnique({ where: { codigo } });
  }

  async create(data: Prisma.ExpedicionCreateInput) {
    return prisma.expedicion.create({ data });
  }

  async update(id: string, data: Prisma.ExpedicionUpdateInput) {
    return prisma.expedicion.update({ where: { id }, data });
  }

  async updateStatus(id: string, estado: EstadoExpedicion) {
    return prisma.expedicion.update({
      where: { id },
      data: { estado },
    });
  }

  async getLastShipmentByPrefix(prefix: string) {
    return prisma.expedicion.findFirst({
      where: { codigo: { startsWith: prefix } },
      orderBy: { codigo: 'desc' },
    });
  }

  async getRecentShipments(limit: number = 5) {
    return prisma.expedicion.findMany({
      take: limit,
      orderBy: { creadoEn: 'desc' },
      include: {
        cliente: { select: { nombre: true } },
      },
    });
  }

  async getShipmentsByClient(clienteId: string) {
    return prisma.expedicion.findMany({
      where: { clienteId },
      orderBy: { creadoEn: 'desc' },
      include: {
        items: {
          include: {
            lote: {
              select: { codigo: true, producto: { select: { nombre: true } } },
            },
          },
        },
      },
    });
  }
}