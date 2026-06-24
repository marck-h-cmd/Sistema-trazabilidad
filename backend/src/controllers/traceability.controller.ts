import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { TraceabilityService } from '@services/traceability.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';
import { ApiError } from '@utils/errors';

const traceabilityService = new TraceabilityService();

export class TraceabilityController {
  getByCode = asyncHandler(async (req: Request, res: Response) => {
    const traceability = await traceabilityService.getFullTraceability(req.params.codigo, req.user);
    res.json(formatApiResponse(traceability));
  });

  getBackward = asyncHandler(async (req: Request, res: Response) => {
    const lote = await prisma.lote.findUnique({ where: { codigo: req.params.codigo } });
    if (!lote) throw ApiError.notFound('Lote no encontrado');
    const backward = await traceabilityService.getBackwardTrace(lote.id, req.user);
    res.json(formatApiResponse(backward));
  });

  getForward = asyncHandler(async (req: Request, res: Response) => {
    const lote = await prisma.lote.findUnique({ where: { codigo: req.params.codigo } });
    if (!lote) throw ApiError.notFound('Lote no encontrado');
    const forward = await traceabilityService.getForwardTrace(lote.id, req.user);
    res.json(formatApiResponse(forward));
  });

  getPublic = asyncHandler(async (req: Request, res: Response) => {
    const publicData = await traceabilityService.getPublicTraceability(req.params.codigo);
    res.json(formatApiResponse(publicData));
  });
}

export const traceabilityController = new TraceabilityController();