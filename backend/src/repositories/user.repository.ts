import { prisma } from '@config/database';
import { Prisma, RolUsuario, EstadoUsuario } from '@prisma/client';

export class UserRepository {
  async findAll(params: {
    skip: number;
    take: number;
    where?: Prisma.UsuarioWhereInput;
    orderBy?: Prisma.UsuarioOrderByWithRelationInput;
  }) {
    const [users, total] = await Promise.all([
      prisma.usuario.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy || { creadoEn: 'desc' },
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
          forzarCambioContrasena: true,
          configuracionEscaneo: true,
          creadoEn: true,
        },
      }),
      prisma.usuario.count({ where: params.where }),
    ]);
    return { users, total };
  }

  async findById(id: string) {
    return prisma.usuario.findUnique({
      where: { id },
      include: {
        cliente: true,
        proveedor: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  }

  async create(data: Prisma.UsuarioCreateInput) {
    return prisma.usuario.create({ data });
  }

  async update(id: string, data: Prisma.UsuarioUpdateInput) {
    return prisma.usuario.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.usuario.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });
  }

  async countByRole(rol: RolUsuario) {
    return prisma.usuario.count({ where: { rol } });
  }
}