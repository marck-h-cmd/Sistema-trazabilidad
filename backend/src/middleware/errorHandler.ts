import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/errors';
import { logger } from '@utils/logger';
import { ZodError } from 'zod';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.requestId,
  });

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error de validación',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Error en la base de datos',
      },
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : err.message,
    },
  });
};