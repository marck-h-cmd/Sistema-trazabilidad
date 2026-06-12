import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/errors';

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized('No autenticado');
    }

    if (!allowedRoles.includes(req.user.rol)) {
      throw ApiError.forbidden('No tienes permisos para realizar esta acción');
    }

    next();
  };
};