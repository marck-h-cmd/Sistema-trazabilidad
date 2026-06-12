import { Request, Response } from 'express';
import { AuthService } from '@services/auth.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';
import { loginSchema, registerSchema, changePasswordSchema } from '@utils/validators';
import { ApiError } from '@utils/errors';

const authService = new AuthService();

export class AuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data, req.ip, req.headers['user-agent']);
    res.json(formatApiResponse(result, 'Inicio de sesión exitoso'));
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const data = registerSchema.parse(req.body);
    const user = await authService.register(data);
    res.status(201).json(formatApiResponse(user, 'Usuario registrado exitosamente'));
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw ApiError.badRequest('Token de refresco es obligatorio');
    }
    const tokens = await authService.refreshToken(refreshToken, req.ip, req.headers['user-agent']);
    res.json(formatApiResponse(tokens, 'Token renovado exitosamente'));
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    await authService.logout(req.user.id, req.token || '');
    res.json(formatApiResponse(null, 'Sesión cerrada exitosamente'));
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const user = await authService.getProfile(req.user.id);
    res.json(formatApiResponse(user));
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const data = changePasswordSchema.parse(req.body);
    await authService.changePassword(req.user.id, data.currentPassword, data.newPassword);
    res.json(formatApiResponse(null, 'Contraseña actualizada exitosamente'));
  });
}

export const authController = new AuthController();