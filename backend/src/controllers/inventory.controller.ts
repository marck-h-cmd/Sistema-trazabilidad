import { Request, Response } from 'express';
import { InventoryService } from '@services/inventory.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';

const inventoryService = new InventoryService();

export class InventoryController {
  getMovements = asyncHandler(async (req: Request, res: Response) => {
    const result = await inventoryService.getMovements({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      loteId: req.query.loteId as string,
      tipo: req.query.tipo as string,
      fechaDesde: req.query.fechaDesde as string,
      fechaHasta: req.query.fechaHasta as string,
    });

    res.json({ success: true, ...result });
  });

  getMovementsByLot = asyncHandler(async (req: Request, res: Response) => {
    const movements = await inventoryService.getMovementsByLot(req.params.lotId);
    res.json(formatApiResponse(movements));
  });

  moveLot = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error('Usuario no autenticado');
    const movement = await inventoryService.moveLot(req.body, req.user.id);
    res.status(201).json(formatApiResponse(movement, 'Lote movido exitosamente'));
  });

  getStockByLot = asyncHandler(async (req: Request, res: Response) => {
    const stock = await inventoryService.getStockByLot(req.params.lotId);
    res.json(formatApiResponse(stock));
  });

  getStockByLocation = asyncHandler(async (req: Request, res: Response) => {
    const stock = await inventoryService.getStockByLocation(req.params.locationId);
    res.json(formatApiResponse(stock));
  });

  getExpiringSoon = asyncHandler(async (req: Request, res: Response) => {
    const dias = parseInt(req.query.dias as string) || 7;
    const lotes = await inventoryService.getExpiringSoon(dias);
    res.json(formatApiResponse(lotes));
  });

  getFifoSuggestions = asyncHandler(async (req: Request, res: Response) => {
    const { productoId, cantidad } = req.query;
    const suggestions = await inventoryService.getFifoSuggestions(
      productoId as string,
      parseFloat(cantidad as string) || 1
    );
    res.json(formatApiResponse(suggestions));
  });

  validateFifo = asyncHandler(async (req: Request, res: Response) => {
    const result = await inventoryService.validateFifoSelection(req.body.lotes);
    res.json(formatApiResponse(result));
  });

  getRecent = asyncHandler(async (req: Request, res: Response) => {
    const movements = await inventoryService.getRecentMovements(
      parseInt(req.query.limit as string) || 10
    );
    res.json(formatApiResponse(movements));
  });
}

export const inventoryController = new InventoryController();