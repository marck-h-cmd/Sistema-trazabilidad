import { prisma } from '@config/database';
import { Prisma } from '@prisma/client';

export class ProductionRepository {
  async findAll(params: {
    skip: number;
    take: number;
    where?: Prisma.ProduccionWhereInput;
    orderBy?: Prisma.ProduccionOrderByWithRelationInput;
  }) {
    const [productions, total] = await Promise.all([
      prisma.produccion.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy || { creadoEn: 'desc' },
        include: {
          lote: {
            select: { id: true, codigo: true, producto: { select: { nombre: true, sku: true } } },
          },
          lineaProduccion: {
            select: { id: true, codigo: true, nombre: true },
          },
          operario: {
            select: { id: true, nombre: true, apellido: true },
          },
        },
      }),
      prisma.produccion.count({ where: params.where }),
    ]);
    return { productions, total };
  }

  async findById(id: string) {
    return prisma.produccion.findUnique({
      where: { id },
      include: {
        lote: {
          include: {
            producto: true,
          },
        },
        lineaProduccion: true,
        operario: { select: { id: true, nombre: true, apellido: true } },
        materiasPrimas: {
          include: {
            lote: {
              select: { codigo: true, producto: { select: { nombre: true } } },
            },
            proveedor: { select: { nombre: true } },
          },
        },
        documentos: true,
      },
    });
  }

  async findByLotId(loteId: string) {
    return prisma.produccion.findUnique({
      where: { loteId },
    });
  }

  async create(data: Prisma.ProduccionCreateInput) {
    return prisma.produccion.create({ data });
  }

  async update(id: string, data: Prisma.ProduccionUpdateInput) {
    return prisma.produccion.update({ where: { id }, data });
  }

  async getRecentProductions(limit: number = 5) {
    return prisma.produccion.findMany({
      take: limit,
      orderBy: { creadoEn: 'desc' },
      include: {
        lote: {
          select: { codigo: true, producto: { select: { nombre: true } } },
        },
        lineaProduccion: { select: { codigo: true } },
      },
    });
  }
}