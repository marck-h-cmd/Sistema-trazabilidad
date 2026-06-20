import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { asyncHandler, formatApiResponse } from '@utils/helpers';
import { ApiError } from '@utils/errors';

export const productionLineController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const lineas = await prisma.lineaProduccion.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
    res.json(formatApiResponse(lineas));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const linea = await prisma.lineaProduccion.findUnique({
      where: { id },
    });
    if (!linea) {
      throw new ApiError(404, 'Línea de producción no encontrada');
    }
    res.json(formatApiResponse(linea));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const { codigo, nombre, descripcion, capacidadDiaria } = req.body;
    const linea = await prisma.lineaProduccion.create({
      data: { codigo, nombre, descripcion },
    });
    res.status(201).json(formatApiResponse(linea, 'Línea de producción creada exitosamente'));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const linea = await prisma.lineaProduccion.update({
      where: { id },
      data,
    });
    res.json(formatApiResponse(linea, 'Línea de producción actualizada exitosamente'));
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.lineaProduccion.update({
      where: { id },
      data: { activo: false },
    });
    res.json(formatApiResponse({ id }, 'Línea de producción desactivada exitosamente'));
  })
};
