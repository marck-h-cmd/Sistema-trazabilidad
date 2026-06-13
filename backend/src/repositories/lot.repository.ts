import { prisma } from '@config/database';
import { Prisma, EstadoLote } from '@prisma/client';

export class LotRepository {
  async findAll(params: {
    skip: number;
    take: number;
    where?: Prisma.LoteWhereInput;
    orderBy?: Prisma.LoteOrderByWithRelationInput;
  }) {
    const [lots, total] = await Promise.all([
      prisma.lote.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy || { creadoEn: 'desc' },
        include: {
          producto: {
            select: { id: true, nombre: true, sku: true, categoria: true },
          },
          ubicacion: {
            select: { id: true, codigoCompleto: true, codigoBarras: true },
          },
          almacen: {
            select: { id: true, nombre: true, codigo: true },
          },
        },
      }),
      prisma.lote.count({ where: params.where }),
    ]);
    return { lots, total };
  }

  async findById(id: string) {
    return prisma.lote.findUnique({
      where: { id },
      include: {
        producto: true,
        ubicacion: {
          include: { almacen: true },
        },
        almacen: true,
        materiasPrimas: {
          include: {
            proveedor: true,
          },
        },
        produccion: {
          include: {
            lineaProduccion: true,
            operario: {
              select: { id: true, nombre: true, apellido: true },
            },
          },
        },
        movimientos: {
          include: {
            usuario: {
              select: { id: true, nombre: true, apellido: true },
            },
            ubicacionOrigen: true,
            ubicacionDestino: true,
          },
          orderBy: { creadoEn: 'asc' },
        },
        itemsExpedicion: {
          include: {
            expedicion: {
              include: {
                cliente: true,
              },
            },
          },
        },
        alertas: {
          orderBy: { fechaCreacion: 'desc' },
          take: 5,
        },
      },
    });
  }

  async findByCode(codigo: string) {
    return prisma.lote.findUnique({
      where: { codigo },
      include: {
        producto: true,
        ubicacion: {
          include: { almacen: true },
        },
      },
    });
  }

  async create(data: Prisma.LoteCreateInput) {
    return prisma.lote.create({ data });
  }

  async update(id: string, data: Prisma.LoteUpdateInput) {
    return prisma.lote.update({ where: { id }, data });
  }

  async updateStatus(id: string, estado: EstadoLote) {
    return prisma.lote.update({
      where: { id },
      data: { estado },
    });
  }

  async getExpiringLotes(days: number) {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + days);

    return prisma.lote.findMany({
      where: {
        estado: 'ACTIVO',
        fechaCaducidad: {
          not: null,
          lte: limitDate,
        },
      },
      include: {
        producto: {
          select: { id: true, nombre: true, sku: true },
        },
        ubicacion: {
          select: { codigoCompleto: true },
        },
      },
      orderBy: { fechaCaducidad: 'asc' },
    });
  }

  async getLastLotByPrefix(prefix: string) {
    return prisma.lote.findFirst({
      where: {
        codigo: { startsWith: prefix },
      },
      orderBy: { codigo: 'desc' },
    });
  }

  async bulkUpdateStatus(loteIds: string[], estado: EstadoLote) {
    return prisma.lote.updateMany({
      where: { id: { in: loteIds } },
      data: { estado },
    });
  }
}