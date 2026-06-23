import { prisma } from '@config/database';
import { ApiError } from '@utils/errors';
import { getPaginationParams, getPaginationMeta } from '@utils/pagination';
import { Prisma } from '@prisma/client';

export class CustomerService {
  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    tipo?: string;
    activo?: boolean;
  }) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: Prisma.ClienteWhereInput = {
      activo: query.activo !== undefined ? query.activo : true,
    };

    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { codigo: { contains: query.search, mode: 'insensitive' } },
        { nif: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.tipo) {
      where.tipo = query.tipo;
    }

    const [customers, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip,
        take,
        orderBy: { creadoEn: 'desc' },
      }),
      prisma.cliente.count({ where }),
    ]);

    return {
      data: customers,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string) {
    const customer = await prisma.cliente.findUnique({ where: { id } });

    if (!customer) {
      throw ApiError.notFound('Cliente no encontrado');
    }

    return customer;
  }

  async findByCode(codigo: string) {
    const customer = await prisma.cliente.findUnique({ where: { codigo } });

    if (!customer) {
      throw ApiError.notFound('Cliente no encontrado');
    }

    return customer;
  }

  async create(data: {
    codigo: string;
    nombre: string;
    tipo: string;
    nif: string;
    direccion: string;
    ciudad: string;
    pais: string;
    nombreContacto: string;
    emailContacto: string;
    telefonoContacto?: string;
    direccionEnvio?: string;
  }) {
    const existingCode = await prisma.cliente.findUnique({ where: { codigo: data.codigo } });

    if (existingCode) {
      throw ApiError.conflict('Ya existe un cliente con ese código');
    }

    const existingNif = await prisma.cliente.findUnique({ where: { nif: data.nif } });

    if (existingNif) {
      throw ApiError.conflict('Ya existe un cliente con ese NIF');
    }

    return prisma.cliente.create({ data });
  }

  async update(id: string, data: Partial<{
    nombre: string;
    tipo: string;
    nif: string;
    direccion: string;
    ciudad: string;
    pais: string;
    nombreContacto: string;
    emailContacto: string;
    telefonoContacto: string;
    direccionEnvio: string;
    activo: boolean;
  }>) {
    await this.findById(id);
    return prisma.cliente.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    return prisma.cliente.update({ where: { id }, data: { activo: false } });
  }
}