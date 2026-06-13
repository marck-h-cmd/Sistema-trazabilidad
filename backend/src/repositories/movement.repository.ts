import { prisma } from '@config/database';
import { Prisma, TipoMovimiento } from '@prisma/client';

export class MovementRepository {
  async findAll(params: {
    skip: number;
    take: number;
    where?: Prisma.MovimientoLoteWhereInput;
    orderBy?: Prisma.MovimientoLoteOrderByWithRelationInput;
  }) {
    const [movements, total] = await Promise.all([
      prisma.movimientoLote.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy || { creadoEn: 'desc' },
        include: {
          lote: {
            select: {
              id: true,
              codigo: true,
              producto: { select: { nombre: true, sku: true } },
            },
          },
          usuario: {
            select: { id: true, nombre: true, apellido: true },
          },
          ubicacionOrigen: {
            select: { id: true, codigoCompleto: true },
          },
          ubicacionDestino: {
            select: { id: true, codigoCompleto: true },
          },
        },
      }),
      prisma.movimientoLote.count({ where: params.where }),
    ]);
    return { movements, total };
  }

  async findByLotId(lotId: string) {
    return prisma.movimientoLote.findMany({
      where: { loteId },
      orderBy: { creadoEn: 'asc' },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true },
        },
        ubicacionOrigen: { select: { codigoCompleto: true } },
        ubicacionDestino: { select: { codigoCompleto: true } },
      },
    });
  }

  async create(data: Prisma.MovimientoLoteCreateInput) {
    return prisma.movimientoLote.create({ data });
  }

  async getRecentMovements(limit: number = 10) {
    return prisma.movimientoLote.findMany({
      take: limit,
      orderBy: { creadoEn: 'desc' },
      include: {
        lote: {
          select: { id: true, codigo: true },
        },
        usuario: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    });
  }

  async countByType(tipo: TipoMovimiento, dateFilter?: { gte: Date; lte: Date }) {
    return prisma.movimientoLote.count({
      where: {
        tipo,
        ...(dateFilter && { creadoEn: dateFilter }),
      },
    });
  }
}