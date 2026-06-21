import { prisma } from '@config/database';
import { Prisma } from '@prisma/client';

export class ReceptionRepository {
  async findAll(params: {
    skip: number;
    take: number;
    where?: Prisma.RecepcionWhereInput;
    orderBy?: Prisma.RecepcionOrderByWithRelationInput;
  }) {
    const [receptions, total] = await Promise.all([
      prisma.recepcion.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy || { creadoEn: 'desc' },
        include: {
          proveedor: {
            select: { id: true, nombre: true, codigo: true },
          },
          receptor: {
            select: { id: true, nombre: true, apellido: true },
          },
        },
      }),
      prisma.recepcion.count({ where: params.where }),
    ]);
    return { receptions, total };
  }

  async findById(id: string) {
    return prisma.recepcion.findUnique({
      where: { id },
      include: {
        proveedor: true,
        receptor: {
          select: { id: true, nombre: true, apellido: true },
        },
        lotes: {
          include: {
            producto: {
              select: { id: true, nombre: true, sku: true, categoria: true },
            },
          },
        },
        documentos: true,
      },
    });
  }

  async findByCode(codigo: string) {
    return prisma.recepcion.findUnique({ where: { codigo } });
  }

  async create(data: Prisma.RecepcionCreateInput) {
    return prisma.recepcion.create({ data });
  }

  async update(id: string, data: Prisma.RecepcionUpdateInput) {
    return prisma.recepcion.update({ where: { id }, data });
  }

  async getLastReceptionByPrefix(prefix: string) {
    return prisma.recepcion.findFirst({
      where: { codigo: { startsWith: prefix } },
      orderBy: { codigo: 'desc' },
    });
  }

  async getRecentReceptions(limit: number = 5) {
    return prisma.recepcion.findMany({
      take: limit,
      orderBy: { creadoEn: 'desc' },
      include: {
        proveedor: { select: { nombre: true } },
        receptor: { select: { nombre: true, apellido: true } },
      },
    });
  }
}
