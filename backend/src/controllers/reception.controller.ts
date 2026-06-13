import { Request, Response } from 'express';
import { ReceptionService } from '@services/reception.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';

const receptionService = new ReceptionService();

export class ReceptionController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await receptionService.findAll({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      proveedorId: req.query.proveedorId as string,
      fechaDesde: req.query.fechaDesde as string,
      fechaHasta: req.query.fechaHasta as string,
      estado: req.query.estado as string,
    });

    res.json({ success: true, ...result });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const reception = await receptionService.findById(req.params.id);
    res.json(formatApiResponse(reception));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error('Usuario no autenticado');
    const reception = await receptionService.create(req.body, req.user.id);
    res.status(201).json(formatApiResponse(reception, 'Recepción creada exitosamente'));
  });

  scanBarcode = asyncHandler(async (req: Request, res: Response) => {
    const { barcode } = req.body;
    const result = await receptionService.processScannedBarcode(barcode);
    res.json(formatApiResponse(result, 'Código de barras procesado'));
  });

  getRecent = asyncHandler(async (req: Request, res: Response) => {
    const receptions = await receptionService.getRecentReceptions(
      parseInt(req.query.limit as string) || 5
    );
    res.json(formatApiResponse(receptions));
  });
}

export const receptionController = new ReceptionController();