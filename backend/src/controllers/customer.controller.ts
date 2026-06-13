import { Request, Response } from 'express';
import { CustomerService } from '@services/customer.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';

const customerService = new CustomerService();

export class CustomerController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await customerService.findAll({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      search: req.query.search as string,
      tipo: req.query.tipo as string,
      activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined,
    });

    res.json({ success: true, ...result });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customerService.findById(req.params.id);
    res.json(formatApiResponse(customer));
  });

  getByCode = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customerService.findByCode(req.params.codigo);
    res.json(formatApiResponse(customer));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customerService.create(req.body);
    res.status(201).json(formatApiResponse(customer, 'Cliente creado exitosamente'));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customerService.update(req.params.id, req.body);
    res.json(formatApiResponse(customer, 'Cliente actualizado exitosamente'));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await customerService.delete(req.params.id);
    res.json(formatApiResponse(null, 'Cliente desactivado exitosamente'));
  });
}

export const customerController = new CustomerController();