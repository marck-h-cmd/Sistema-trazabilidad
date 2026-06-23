import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { asyncHandler, formatApiResponse } from '@utils/helpers';
import { ApiError } from '@utils/errors';

export const productionLineController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const lineas = await prisma.lineaProduccion.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      include: {
        productos: {
          include: {
            producto: true,
          },
        },
      },
    });
    res.json(formatApiResponse(lineas));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const linea = await prisma.lineaProduccion.findUnique({
      where: { id },
      include: {
        productos: {
          include: {
            producto: true,
          },
        },
      },
    });
    if (!linea) {
      throw new ApiError(404, 'Línea de producción no encontrada');
    }
    res.json(formatApiResponse(linea));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const { codigo, nombre, descripcion, codigoBarras, productoId } = req.body;
    
    const result = await prisma.$transaction(async (tx) => {
      const linea = await tx.lineaProduccion.create({
        data: { codigo, nombre, descripcion, codigoBarras },
      });

      if (productoId) {
        await tx.lineaProduccionProducto.create({
          data: {
            lineaProduccionId: linea.id,
            productoId,
            esPorDefecto: true,
            tiempoProduccion: 120,
          },
        });
      }

      return linea;
    });

    res.status(201).json(formatApiResponse(result, 'Línea de producción creada exitosamente'));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { codigo, nombre, descripcion, codigoBarras, productoId } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const linea = await tx.lineaProduccion.update({
        where: { id },
        data: { codigo, nombre, descripcion, codigoBarras },
      });

      if (productoId !== undefined) {
        await tx.lineaProduccionProducto.deleteMany({
          where: { lineaProduccionId: id },
        });

        if (productoId) {
          await tx.lineaProduccionProducto.create({
            data: {
              lineaProduccionId: id,
              productoId,
              esPorDefecto: true,
              tiempoProduccion: 120,
            },
          });
        }
      }

      return linea;
    });

    res.json(formatApiResponse(result, 'Línea de producción actualizada exitosamente'));
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
