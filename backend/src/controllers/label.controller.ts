import { Request, Response } from 'express';
import { LabelService } from '@services/label.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';

const labelService = new LabelService();

export class LabelController {
  generateLabels = asyncHandler(async (req: Request, res: Response) => {
    const result = await labelService.generateLabels(req.body);
    res.json(formatApiResponse(result));
  });

  getTemplates = asyncHandler(async (req: Request, res: Response) => {
    const templates = await labelService.getTemplates(req.query.productoId as string);
    res.json(formatApiResponse(templates));
  });

  createTemplate = asyncHandler(async (req: Request, res: Response) => {
    const template = await labelService.createTemplate(req.body);
    res.status(201).json(formatApiResponse(template, 'Plantilla creada exitosamente'));
  });

  updateTemplate = asyncHandler(async (req: Request, res: Response) => {
    const template = await labelService.updateTemplate(req.params.id, req.body);
    res.json(formatApiResponse(template, 'Plantilla actualizada exitosamente'));
  });

  deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
    await labelService.deleteTemplate(req.params.id);
    res.json(formatApiResponse(null, 'Plantilla desactivada exitosamente'));
  });
}

export const labelController = new LabelController();