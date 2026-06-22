import { prisma } from '@config/database';
import { ApiError } from '@utils/errors';
import { getPaginationParams, getPaginationMeta } from '@utils/pagination';
import { Prisma } from '@prisma/client';

export class WarehouseService {
  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: Prisma.AlmacenWhereInput = {
      activo: true,
    };

    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { codigo: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [warehouses, total] = await Promise.all([
      prisma.almacen.findMany({
        where,
        skip,
        take,
        orderBy: { creadoEn: 'desc' },
        include: {
          ubicaciones: {
            where: { activo: true },
            select: { id: true, codigoCompleto: true },
          },
        },
      }),
      prisma.almacen.count({ where }),
    ]);

    return {
      data: warehouses,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string) {
    const warehouse = await prisma.almacen.findUnique({
      where: { id },
      include: {
        ubicaciones: {
          where: { activo: true },
          orderBy: { codigoCompleto: 'asc' },
        },
      },
    });

    if (!warehouse) {
      throw ApiError.notFound('Almacén no encontrado');
    }

    return warehouse;
  }

  async create(data: { codigo: string; nombre: string; direccion: string; tipo?: string }) {
    const existing = await prisma.almacen.findUnique({ where: { codigo: data.codigo } });

    if (existing) {
      throw ApiError.conflict('Ya existe un almacén con ese código');
    }

    return prisma.almacen.create({ data });
  }

  async update(id: string, data: Partial<{ nombre: string; direccion: string; tipo: string; activo: boolean }>) {
    await this.findById(id);
    return prisma.almacen.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    return prisma.almacen.update({ where: { id }, data: { activo: false } });
  }

  async createLocation(data: {
    almacenId: string;
    zona: string;
    pasillo: string;
    estanteria: string;
    nivel: string;
    codigoBarras?: string;
    capacidadMaxima?: number;
  }) {
    await this.findById(data.almacenId);

    const codigoCompleto = `ZONA-${data.zona}-PASILLO-${data.pasillo}-ESTANTERIA-${data.estanteria}-NIVEL-${data.nivel}`;

    const existing = await prisma.ubicacion.findUnique({ where: { codigoCompleto } });

    if (existing) {
      throw ApiError.conflict('Ya existe una ubicación con ese código');
    }

    return prisma.ubicacion.create({
      data: {
        almacenId: data.almacenId,
        zona: data.zona,
        pasillo: data.pasillo,
        estanteria: data.estanteria,
        nivel: data.nivel,
        codigoBarras: data.codigoBarras,
        codigoCompleto,
        capacidadMaxima: data.capacidadMaxima,
      },
    });
  }

  async getLocations(almacenId: string) {
    await this.findById(almacenId);

    return prisma.ubicacion.findMany({
      where: { almacenId, activo: true },
      orderBy: { codigoCompleto: 'asc' },
    });
  }
}