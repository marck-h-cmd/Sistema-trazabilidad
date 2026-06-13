import { Request, Response } from 'express';
import { AlertService } from '@services/alert.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';

const alertService = new AlertService();

export class AlertController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await alertService.findAll({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      estado: req.query.estado as string,
      severidad: req.query.severidad as string,
      tipo: req.query.tipo as string,
      loteId: req.query.loteId as string,
      fechaDesde: req.query.fechaDesde as string,
      fechaHasta: req.query.fechaHasta as string,
    });

    res.json({ success: true, ...result });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const alert = await alertService.findById(req.params.id);
    res.json(formatApiResponse(alert));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error('Usuario no autenticado');
    const alert = await alertService.create(req.body, req.user.id);
    res.status(201).json(formatApiResponse(alert, 'Alerta creada exitosamente'));
  });

  analyzeImpact = asyncHandler(async (req: Request, res: Response) => {
    const impact = await alertService.analyzeImpact(req.params.id);
    res.json(formatApiResponse(impact, 'Análisis de impacto completado'));
  });

  activate = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error('Usuario no autenticado');
    const result = await alertService.activate(req.params.id, req.user.id);
    res.json(formatApiResponse(result, 'Alerta activada exitosamente'));
  });

  resolve = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error('Usuario no autenticado');
    const alert = await alertService.resolve(req.params.id, req.body, req.user.id);
    res.json(formatApiResponse(alert, 'Alerta resuelta exitosamente'));
  });

  close = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error('Usuario no autenticado');
    const alert = await alertService.close(req.params.id, req.user.id);
    res.json(formatApiResponse(alert, 'Alerta cerrada exitosamente'));
  });

  updateRecovery = asyncHandler(async (req: Request, res: Response) => {
    const alert = await alertService.updateRecoveryStats(req.params.id, req.body);
    res.json(formatApiResponse(alert, 'Estadísticas de recuperación actualizadas'));
  });

  getActive = asyncHandler(async (req: Request, res: Response) => {
    const alerts = await alertService.getActiveAlerts();
    res.json(formatApiResponse(alerts));
  });
}

export const alertController = new AlertController();