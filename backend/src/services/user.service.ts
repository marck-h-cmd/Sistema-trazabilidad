import { UserRepository } from '@repositories/user.repository';
import { ApiError } from '@utils/errors';
import { CreateUserDTO, UpdateUserDTO, UserQueryParams } from '@types/user.types';
import { getPaginationParams, getPaginationMeta } from '@utils/pagination';
import { sanitizeUser } from '@utils/helpers';
import { Prisma, RolUsuario, EstadoUsuario } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async findAll(query: UserQueryParams) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

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

    const orderBy: Prisma.UsuarioOrderByWithRelationInput = {};
    if (query.sortBy) {
      orderBy[query.sortBy as keyof Prisma.UsuarioOrderByWithRelationInput] = query.sortOrder || 'desc';
    } else {
      orderBy.creadoEn = 'desc';
    }

    const { users, total } = await this.userRepository.findAll({
      skip,
      take,
      where,
      orderBy,
    });

    return {
      data: users,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    return sanitizeUser(user);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    return user;
  }

  async create(data: CreateUserDTO) {
    const existing = await this.userRepository.findByEmail(data.email);

    if (existing) {
      throw ApiError.conflict('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.userRepository.create({
      email: data.email,
      contrasena: hashedPassword,
      nombre: data.nombre,
      apellido: data.apellido,
      rol: data.rol || 'RECEPCION',
      telefono: data.telefono,
      forzarCambioContrasena: true,
    });

    return sanitizeUser(user);
  }

  async update(id: string, data: UpdateUserDTO) {
    await this.findById(id);

    const updateData: Prisma.UsuarioUpdateInput = {};

    if (data.nombre) updateData.nombre = data.nombre;
    if (data.apellido) updateData.apellido = data.apellido;
    if (data.rol) updateData.rol = data.rol as RolUsuario;
    if (data.estado) updateData.estado = data.estado as EstadoUsuario;
    if (data.telefono !== undefined) updateData.telefono = data.telefono;
    if (data.forzarCambioContrasena !== undefined) updateData.forzarCambioContrasena = data.forzarCambioContrasena;
    if (data.configuracionEscaneo) updateData.configuracionEscaneo = data.configuracionEscaneo;

    const updated = await this.userRepository.update(id, updateData);

    return sanitizeUser(updated);
  }

  async delete(id: string) {
    await this.findById(id);

    await this.userRepository.update(id, { estado: 'INACTIVO' });
  }

  async updateScannerConfig(id: string, config: Record<string, string>) {
    await this.findById(id);

    const updated = await this.userRepository.update(id, {
      configuracionEscaneo: config,
    });

    return sanitizeUser(updated);
  }

  async resetPassword(id: string, newPassword: string) {
    await this.findById(id);

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.userRepository.update(id, {
      contrasena: hashedPassword,
      forzarCambioContrasena: true,
    });
  }

  async countByRole(rol: RolUsuario) {
    return this.userRepository.countByRole(rol);
  }
}