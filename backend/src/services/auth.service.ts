import { prisma } from '@config/database';
import { ApiError } from '@utils/errors';
import { AuthUser } from '@types/auth.types';
import { sanitizeUser, getPaginationMeta } from '@utils/helpers';
import { getPaginationParams } from '@utils/pagination';
import { PaginationDTO } from '@utils/validators';
import { Prisma, RolUsuario, EstadoUsuario } from '@prisma/client';

export class UserService {
  async findAll(query: PaginationDTO & { rol?: string; estado?: string; search?: string }) {
    const { skip, take, page, limit } = getPaginationParams(query);

    const where: Prisma.UsuarioWhereInput = {};

    if (query.rol) {
      where.rol = query.rol as RolUsuario;
    }

    if (query.estado) {
      where.estado = query.estado as EstadoUsuario;
    }

    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { apellido: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip,
        take,
        orderBy: { creadoEn: 'desc' },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          rol: true,
          estado: true,
          telefono: true,
          avatar: true,
          ultimoInicioSesion: true,
          creadoEn: true,
        },
      }),
      prisma.usuario.count({ where }),
    ]);

    return {
      data: users,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string): Promise<AuthUser> {
    const user = await prisma.usuario.findUnique({ where: { id } });

    if (!user) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    return sanitizeUser(user) as AuthUser;
  }

  async create(data: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    rol: RolUsuario;
    telefono?: string;
  }): Promise<AuthUser> {
    const existing = await prisma.usuario.findUnique({ where: { email: data.email } });

    if (existing) {
      throw ApiError.conflict('El email ya está registrado');
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.usuario.create({
      data: {
        email: data.email,
        contrasena: hashedPassword,
        nombre: data.nombre,
        apellido: data.apellido,
        rol: data.rol,
        telefono: data.telefono,
        forzarCambioContrasena: true,
      },
    });

    return sanitizeUser(user) as AuthUser;
  }

  async update(id: string, data: Partial<{
    nombre: string;
    apellido: string;
    rol: RolUsuario;
    estado: EstadoUsuario;
    telefono: string;
    configuracionEscaneo: any;
  }>): Promise<AuthUser> {
    const user = await prisma.usuario.findUnique({ where: { id } });

    if (!user) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    const updated = await prisma.usuario.update({
      where: { id },
      data,
    });

    return sanitizeUser(updated) as AuthUser;
  }

  async delete(id: string): Promise<void> {
    const user = await prisma.usuario.findUnique({ where: { id } });

    if (!user) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    await prisma.usuario.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });
  }

  async updateScannerConfig(id: string, config: any): Promise<AuthUser> {
    const user = await prisma.usuario.findUnique({ where: { id } });

    if (!user) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    const updated = await prisma.usuario.update({
      where: { id },
      data: { configuracionEscaneo: config },
    });

    return sanitizeUser(updated) as AuthUser;
  }
}