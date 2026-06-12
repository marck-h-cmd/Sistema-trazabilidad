import { Request, Response, NextFunction } from 'express';
import { prisma } from '@config/database';

export const auditLog = (action: string, entity: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = req.params.id || body?.data?.id || undefined;

        prisma.registroAuditoria.create({
          data: {
            usuarioId: req.user.id,
            accion: action,
            entidad: entity,
            entidadId: entityId,
            direccionIp: req.ip,
            agenteUsuario: req.headers['user-agent'],
            metadatos: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
            },
          },
        }).catch((err) => {
          console.error('Error creating audit log:', err);
        });
      }

      return originalJson(body);
    };

    next();
  };
};