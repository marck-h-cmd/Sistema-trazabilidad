import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@config/database';
import { jwtConfig } from '@config/jwt';
import { ApiError } from '@utils/errors';
import { TokenPayload, LoginResponse, AuthUser } from '@types/auth.types';
import { LoginDTO, RegisterDTO } from '@utils/validators';
import { sanitizeUser } from '@utils/helpers';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  async login(data: LoginDTO, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    const user = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw ApiError.unauthorized('Credenciales inválidas');
    }

    if (user.estado === 'INACTIVO' || user.estado === 'BLOQUEADO') {
      throw ApiError.forbidden('Usuario inactivo o bloqueado');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.contrasena);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Credenciales inválidas');
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
      apellido: user.apellido,
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    await prisma.sesion.create({
      data: {
        usuarioId: user.id,
        token: accessToken,
        tokenRefresco: refreshToken,
        direccionIp: ipAddress,
        agenteUsuario: userAgent,
        expiraEn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.usuario.update({
      where: { id: user.id },
      data: { ultimoInicioSesion: new Date() },
    });

    await prisma.registroAuditoria.create({
      data: {
        usuarioId: user.id,
        accion: 'INICIAR_SESION',
        entidad: 'Usuario',
        entidadId: user.id,
        direccionIp: ipAddress,
        agenteUsuario: userAgent,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: sanitizeUser(user) as AuthUser,
    };
  }

  async register(data: RegisterDTO): Promise<AuthUser> {
    const existingUser = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw ApiError.conflict('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.usuario.create({
      data: {
        email: data.email,
        contrasena: hashedPassword,
        nombre: data.nombre,
        apellido: data.apellido,
        rol: (data.rol as any) || 'RECEPCION',
        forzarCambioContrasena: true,
      },
    });

    return sanitizeUser(user) as AuthUser;
  }

  async refreshToken(refreshToken: string, ipAddress?: string, userAgent?: string) {
    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as TokenPayload;

      const session = await prisma.sesion.findFirst({
        where: {
          tokenRefresco: refreshToken,
          usuarioId: decoded.id,
        },
      });

      if (!session) {
        throw ApiError.unauthorized('Token de refresco inválido');
      }

      await prisma.sesion.delete({ where: { id: session.id } });

      const tokenPayload: TokenPayload = {
        id: decoded.id,
        email: decoded.email,
        rol: decoded.rol,
        nombre: decoded.nombre,
        apellido: decoded.apellido,
      };

      const newAccessToken = this.generateAccessToken(tokenPayload);
      const newRefreshToken = this.generateRefreshToken(tokenPayload);

      await prisma.sesion.create({
        data: {
          usuarioId: decoded.id,
          token: newAccessToken,
          tokenRefresco: newRefreshToken,
          direccionIp: ipAddress,
          agenteUsuario: userAgent,
          expiraEn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.unauthorized('Token de refresco inválido o expirado');
    }
  }

  async logout(userId: string, token: string): Promise<void> {
    await prisma.sesion.deleteMany({
      where: {
        usuarioId: userId,
        token: token,
      },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });

    if (!user) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    const isValid = await bcrypt.compare(currentPassword, user.contrasena);

    if (!isValid) {
      throw ApiError.badRequest('La contraseña actual es incorrecta');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.usuario.update({
      where: { id: userId },
      data: {
        contrasena: hashedPassword,
        forzarCambioContrasena: false,
      },
    });
  }

  async getProfile(userId: string): Promise<AuthUser> {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });

    if (!user) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    return sanitizeUser(user) as AuthUser;
  }

  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    } as jwt.SignOptions);
  }

  private generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn,
    } as jwt.SignOptions);
  }
}