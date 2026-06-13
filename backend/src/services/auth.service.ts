import { prisma } from '@config/database';
import { ApiError } from '@utils/errors';
import { TokenPayload, LoginResponse, AuthUser } from '@customTypes/auth.types';
import { sanitizeUser } from '@utils/helpers';
import { LoginDTO, RegisterDTO } from '@utils/validators';
import { jwtConfig } from '@config/jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class AuthService {
  async login(data: LoginDTO, ip?: string, userAgent?: string): Promise<LoginResponse> {
    const user = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw ApiError.unauthorized('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.contrasena);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Credenciales inválidas');
    }

    if (user.estado === 'INACTIVO') {
      throw ApiError.unauthorized('El usuario está inactivo');
    }

    if (user.estado === 'BLOQUEADO') {
      throw ApiError.unauthorized('El usuario está bloqueado');
    }

    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
      apellido: user.apellido,
    };

    const accessToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn as any,
    });

    const refreshToken = jwt.sign({ id: user.id }, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn as any,
    });

    // Save session
    await prisma.sesion.create({
      data: {
        usuarioId: user.id,
        token: accessToken,
        tokenRefresco: refreshToken,
        direccionIp: ip || null,
        agenteUsuario: userAgent || null,
        expiraEn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days
      },
    });

    // Update last login
    await prisma.usuario.update({
      where: { id: user.id },
      data: { ultimoInicioSesion: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
      },
    };
  }

  async register(data: RegisterDTO): Promise<AuthUser> {
    const existing = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (existing) {
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
        estado: 'ACTIVO',
      },
    });

    return sanitizeUser(user) as AuthUser;
  }

  async refreshToken(refreshToken: string, ip?: string, userAgent?: string): Promise<{ accessToken: string; refreshToken: string }> {
    const session = await prisma.sesion.findUnique({
      where: { tokenRefresco: refreshToken },
      include: { usuario: true },
    });

    if (!session) {
      throw ApiError.unauthorized('Token de refresco inválido o no encontrado');
    }

    if (session.expiraEn < new Date()) {
      await prisma.sesion.delete({ where: { id: session.id } });
      throw ApiError.unauthorized('Token de refresco expirado');
    }

    if (session.usuario.estado !== 'ACTIVO') {
      throw ApiError.unauthorized('El usuario no está activo');
    }

    try {
      jwt.verify(refreshToken, jwtConfig.refreshSecret);
    } catch (error) {
      await prisma.sesion.delete({ where: { id: session.id } });
      throw ApiError.unauthorized('Token de refresco inválido');
    }

    const user = session.usuario;
    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
      apellido: user.apellido,
    };

    const newAccessToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn as any,
    });

    const newRefreshToken = jwt.sign({ id: user.id }, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn as any,
    });

    // Update the session
    await prisma.sesion.update({
      where: { id: session.id },
      data: {
        token: newAccessToken,
        tokenRefresco: newRefreshToken,
        direccionIp: ip || null,
        agenteUsuario: userAgent || null,
        expiraEn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string, accessToken: string): Promise<void> {
    await prisma.sesion.deleteMany({
      where: {
        usuarioId: userId,
        token: accessToken,
      },
    });
  }

  async getProfile(userId: string): Promise<AuthUser> {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    return sanitizeUser(user) as AuthUser;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.contrasena);
    if (!isPasswordValid) {
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
}