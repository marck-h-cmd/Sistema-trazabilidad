import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '@config/jwt';
import { ApiError } from '@utils/errors';
import { TokenPayload } from '@types/auth.types';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw ApiError.unauthorized('Token de acceso no proporcionado');
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    throw ApiError.unauthorized('Token de acceso no proporcionado');
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as TokenPayload;
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Token expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Token inválido');
    }
    throw ApiError.unauthorized('Error de autenticación');
  }
};