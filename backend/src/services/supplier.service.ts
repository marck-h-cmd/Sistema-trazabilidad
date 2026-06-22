import { prisma } from '@config/database';
import { ApiError } from '@utils/errors';
import { getPaginationParams, getPaginationMeta } from '@utils/pagination';
import { Prisma } from '@prisma/client';

export class SupplierService {
  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    activo?: boolean;
  }) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: Prisma.ProveedorWhereInput = {
      activo: query.activo !== undefined ? query.activo : true,
    };

    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { codigo: { contains: query.search, mode: 'insensitive' } },
        { nif: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.proveedor.findMany({
        where,
        skip,
        take,
        orderBy: { creadoEn: 'desc' },
      }),
      prisma.proveedor.count({ where }),
    ]);

    return {
      data: suppliers,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string) {
    const supplier = await prisma.proveedor.findUnique({ where: { id } });

    if (!supplier) {
      throw ApiError.notFound('Proveedor no encontrado');
    }

    return supplier;
  }

  async findByCode(codigo: string) {
    const supplier = await prisma.proveedor.findUnique({ where: { codigo } });

    if (!supplier) {
      throw ApiError.notFound('Proveedor no encontrado');
    }

    return supplier;
  }

  async create(data: {
    codigo: string;
    nombre: string;
    nif: string;
    direccion: string;
    ciudad: string;
    pais: string;
    nombreContacto: string;
    emailContacto: string;
    telefonoContacto?: string;
    utilizaCodigoBarras?: boolean;
  }) {
    const existingCode = await prisma.proveedor.findUnique({ where: { codigo: data.codigo } });

    if (existingCode) {
      throw ApiError.conflict('Ya existe un proveedor con ese código');
    }

    const existingNif = await prisma.proveedor.findUnique({ where: { nif: data.nif } });

    if (existingNif) {
      throw ApiError.conflict('Ya existe un proveedor con ese NIF');
    }

    return prisma.proveedor.create({ data });
  }

  async update(id: string, data: Partial<{
    nombre: string;
    nif: string;
    direccion: string;
    ciudad: string;
    pais: string;
    nombreContacto: string;
    emailContacto: string;
    telefonoContacto: string;
    utilizaCodigoBarras: boolean;
    activo: boolean;
  }>) {
    await this.findById(id);
    return prisma.proveedor.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    return prisma.proveedor.update({ where: { id }, data: { activo: false } });
  }
}