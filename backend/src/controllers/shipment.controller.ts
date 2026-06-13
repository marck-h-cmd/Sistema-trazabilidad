import { Request, Response } from 'express';
import { ShipmentService } from '@services/shipment.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';

const shipmentService = new ShipmentService();

export class ShipmentController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await shipmentService.findAll({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      clienteId: req.query.clienteId as string,
      estado: req.query.estado as string,
      fechaDesde: req.query.fechaDesde as string,
      fechaHasta: req.query.fechaHasta as string,
      codigo: req.query.codigo as string,
    });

    res.json({ success: true, ...result });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const shipment = await shipmentService.findById(req.params.id);
    res.json(formatApiResponse(shipment));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error('Usuario no autenticado');
    const shipment = await shipmentService.create(req.body, req.user.id);
    res.status(201).json(formatApiResponse(shipment, 'Expedición creada exitosamente'));
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error('Usuario no autenticado');
    const { estado } = req.body;
    const shipment = await shipmentService.updateStatus(req.params.id, estado, req.user.id);
    res.json(formatApiResponse(shipment, `Expedición actualizada a ${estado}`));
  });

  getRecent = asyncHandler(async (req: Request, res: Response) => {
    const shipments = await shipmentService.getRecentShipments(
      parseInt(req.query.limit as string) || 5
    );
    res.json(formatApiResponse(shipments));
  });

  getByClient = asyncHandler(async (req: Request, res: Response) => {
    const shipments = await shipmentService.getShipmentsByClient(req.params.clienteId);
    res.json(formatApiResponse(shipments));
  });
}

export const shipmentController = new ShipmentController();