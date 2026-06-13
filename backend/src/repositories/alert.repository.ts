import { prisma } from '@config/database';
import { Prisma, EstadoAlerta, SeveridadAlerta } from '@prisma/client';

export class AlertRepository {
  async findAll(params: {
    skip: number;
    take: number;
    where?: Prisma.AlertaWhereInput;
    orderBy?: Prisma.AlertaOrderByWithRelationInput;
  }) {
    const [alerts, total] = await Promise.all([
      prisma.alerta.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy || { fechaCreacion: 'desc' },
        include: {
          lote: {
            select: { id: true, codigo: true, producto: { select: { nombre: true } } },
          },
          creador: {
            select: { id: true, nombre: true, apellido: true },
          },
        },
      }),
      prisma.alerta.count({ where: params.where }),
    ]);
    return { alerts, total };
  }

  async findById(id: string) {
    return prisma.alerta.findUnique({
      where: { id },
      include: {
        lote: {
          include: {
            producto: true,
          },
        },
        creador: { select: { id: true, nombre: true, apellido: true } },
        notificaciones: {
          orderBy: { creadoEn: 'desc' },
        },
        documentos: true,
      },
    });
  }

  async findByCode(codigo: string) {
    return prisma.alerta.findUnique({ where: { codigo } });
  }

  async create(data: Prisma.AlertaCreateInput) {
    return prisma.alerta.create({ data });
  }

  async update(id: string, data: Prisma.AlertaUpdateInput) {
    return prisma.alerta.update({ where: { id }, data });
  }

  async updateStatus(id: string, estado: EstadoAlerta) {
    return prisma.alerta.update({
      where: { id },
      data: { estado },
    });
  }

  async getActiveAlerts() {
    return prisma.alerta.findMany({
      where: {
        estado: { in: ['ABIERTA', 'INVESTIGANDO'] },
      },
      include: {
        lote: {
          select: { codigo: true, producto: { select: { nombre: true } } },
        },
      },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async getLastAlertByPrefix(prefix: string) {
    return prisma.alerta.findFirst({
      where: { codigo: { startsWith: prefix } },
      orderBy: { codigo: 'desc' },
    });
  }

  async countByStatus(estado: EstadoAlerta) {
    return prisma.alerta.count({ where: { estado } });
  }

  async countBySeverity(severidad: SeveridadAlerta) {
    return prisma.alerta.count({
      where: {
        severidad,
        estado: { in: ['ABIERTA', 'INVESTIGANDO'] },
      },
    });
  }
}