import { Request, Response } from 'express';
import { WarehouseService } from '@services/warehouse.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';

const warehouseService = new WarehouseService();

export class WarehouseController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await warehouseService.findAll({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      search: req.query.search as string,
    });

    res.json({ success: true, ...result });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const warehouse = await warehouseService.findById(req.params.id);
    res.json(formatApiResponse(warehouse));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const warehouse = await warehouseService.create(req.body);
    res.status(201).json(formatApiResponse(warehouse, 'Almacén creado exitosamente'));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const warehouse = await warehouseService.update(req.params.id, req.body);
    res.json(formatApiResponse(warehouse, 'Almacén actualizado exitosamente'));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await warehouseService.delete(req.params.id);
    res.json(formatApiResponse(null, 'Almacén desactivado exitosamente'));
  });

  createLocation = asyncHandler(async (req: Request, res: Response) => {
    const location = await warehouseService.createLocation({
      ...req.body,
      almacenId: req.params.id,
    });
    res.status(201).json(formatApiResponse(location, 'Ubicación creada exitosamente'));
  });

  getLocations = asyncHandler(async (req: Request, res: Response) => {
    const locations = await warehouseService.getLocations(req.params.id);
    res.json(formatApiResponse(locations));
  });
}

export const warehouseController = new WarehouseController();