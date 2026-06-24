import { Request, Response } from 'express';
import { LotService } from '@services/lot.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';

const lotService = new LotService();

export class LotController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await lotService.findAll({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      search: req.query.search as string,
      codigo: req.query.codigo as string,
      estado: req.query.estado as string,
      productoId: req.query.productoId as string,
      ubicacionId: req.query.ubicacionId as string,
      almacenId: req.query.almacenId as string,
      fechaCaducidadDesde: req.query.fechaCaducidadDesde as string,
      fechaCaducidadHasta: req.query.fechaCaducidadHasta as string,
      disponible: req.query.disponible === 'true',
    });

    res.json({ success: true, ...result });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const lot = await lotService.findById(req.params.id);
    res.json(formatApiResponse(lot));
  });

  getAvailableByProduct = asyncHandler(async (req: Request, res: Response) => {
    const result = await lotService.findAll({
      page: 1,
      limit: 100,
      productoId: req.params.productId,
      estado: 'ACTIVO',
      disponible: true,
    });

    res.json({ success: true, ...result });
  });
}

export const lotController = new LotController();
