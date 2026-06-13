import { Request, Response } from 'express';
import { ProductService } from '@services/product.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';
import { ApiError } from '@utils/errors';

const productService = new ProductService();

export class ProductController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.findAll({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      categoria: req.query.categoria as string,
      search: req.query.search as string,
      activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined,
    });

    res.json({
      success: true,
      ...result,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.findById(req.params.id);
    res.json(formatApiResponse(product));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.create(req.body);
    res.status(201).json(formatApiResponse(product, 'Producto creado exitosamente'));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.update(req.params.id, req.body);
    res.json(formatApiResponse(product, 'Producto actualizado exitosamente'));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await productService.delete(req.params.id);
    res.json(formatApiResponse(null, 'Producto desactivado exitosamente'));
  });

  getByCategory = asyncHandler(async (req: Request, res: Response) => {
    const products = await productService.findByCategory(req.params.categoria);
    res.json(formatApiResponse(products));
  });

  getStockSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await productService.getStockSummary(req.params.id);
    res.json(formatApiResponse(summary));
  });
}

export const productController = new ProductController();