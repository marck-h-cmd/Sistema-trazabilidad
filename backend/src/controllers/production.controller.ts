import { Request, Response } from 'express';
import { ProductionService } from '@services/production.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';

const productionService = new ProductionService();

export class ProductionController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await productionService.findAll({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      lineaProduccionId: req.query.lineaProduccionId as string,
      productoId: req.query.productoId as string,
      fechaDesde: req.query.fechaDesde as string,
      fechaHasta: req.query.fechaHasta as string,
    });

    res.json({ success: true, ...result });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const production = await productionService.findById(req.params.id);
    res.json(formatApiResponse(production));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error('Usuario no autenticado');
    const production = await productionService.create(req.body, req.user.id);
    res.status(201).json(formatApiResponse(production, 'Producción creada exitosamente'));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error('Usuario no autenticado');
    const production = await productionService.update(req.params.id, req.body, req.user.id);
    res.json(formatApiResponse(production, 'Producción actualizada exitosamente'));
  });

  getRecent = asyncHandler(async (req: Request, res: Response) => {
    const productions = await productionService.getRecentProductions(
      parseInt(req.query.limit as string) || 5
    );
    res.json(formatApiResponse(productions));
  });
}

export const productionController = new ProductionController();