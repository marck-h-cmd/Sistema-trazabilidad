import { Request, Response } from 'express';
import { UserService } from '@services/user.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';
import { paginationSchema } from '@utils/validators';
import { ApiError } from '@utils/errors';

const userService = new UserService();

export class UserController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const query = paginationSchema.parse(req.query);
    const result = await userService.findAll({
      ...query,
      rol: req.query.rol as string,
      estado: req.query.estado as string,
      search: req.query.search as string,
    });
    res.json({
      success: true,
      ...result,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.findById(req.params.id);
    res.json(formatApiResponse(user));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.create(req.body);
    res.status(201).json(formatApiResponse(user, 'Usuario creado exitosamente'));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.update(req.params.id, req.body);
    res.json(formatApiResponse(user, 'Usuario actualizado exitosamente'));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await userService.delete(req.params.id);
    res.json(formatApiResponse(null, 'Usuario desactivado exitosamente'));
  });

  updateScannerConfig = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const user = await userService.updateScannerConfig(req.params.id, req.body);
    res.json(formatApiResponse(user, 'Configuración de escaneo actualizada'));
  });
}

export const userController = new UserController();