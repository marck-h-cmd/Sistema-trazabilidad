import { Request, Response } from 'express';
import { SupplierService } from '@services/supplier.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';

const supplierService = new SupplierService();

export class SupplierController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await supplierService.findAll({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      search: req.query.search as string,
      activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined,
    });

    res.json({ success: true, ...result });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const supplier = await supplierService.findById(req.params.id);
    res.json(formatApiResponse(supplier));
  });

  getByCode = asyncHandler(async (req: Request, res: Response) => {
    const supplier = await supplierService.findByCode(req.params.codigo);
    res.json(formatApiResponse(supplier));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const supplier = await supplierService.create(req.body);
    res.status(201).json(formatApiResponse(supplier, 'Proveedor creado exitosamente'));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const supplier = await supplierService.update(req.params.id, req.body);
    res.json(formatApiResponse(supplier, 'Proveedor actualizado exitosamente'));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await supplierService.delete(req.params.id);
    res.json(formatApiResponse(null, 'Proveedor desactivado exitosamente'));
  });
}

export const supplierController = new SupplierController();