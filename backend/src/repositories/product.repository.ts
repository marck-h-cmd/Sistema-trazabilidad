import { prisma } from '@config/database';
import { Prisma, CategoriaProducto } from '@prisma/client';

export class ProductRepository {
  async findAll(params: {
    skip: number;
    take: number;
    where?: Prisma.ProductoWhereInput;
    orderBy?: Prisma.ProductoOrderByWithRelationInput;
  }) {
    const [products, total] = await Promise.all([
      prisma.producto.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy || { creadoEn: 'desc' },
        include: {
          lineasProduccionProductos: {
            include: {
              lineaProduccion: true,
            },
          },
        },
      }),
      prisma.producto.count({ where: params.where }),
    ]);
    return { products, total };
  }

  async findById(id: string) {
    return prisma.producto.findUnique({
      where: { id },
      include: {
        lineasProduccionProductos: {
          include: {
            lineaProduccion: true,
          },
        },
        plantillasEtiquetas: true,
      },
    });
  }

  async findBySku(sku: string) {
    return prisma.producto.findUnique({ where: { sku } });
  }

  async create(data: Prisma.ProductoCreateInput) {
    return prisma.producto.create({ data });
  }

  async update(id: string, data: Prisma.ProductoUpdateInput) {
    return prisma.producto.update({ where: { id }, data });
  }

  async findByCategory(categoria: CategoriaProducto) {
    return prisma.producto.findMany({
      where: { categoria, activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async getStockSummary(productoId: string) {
    const lotes = await prisma.lote.findMany({
      where: {
        productoId,
        estado: 'ACTIVO',
        cantidad: { gt: 0 },
      },
      select: {
        cantidad: true,
        ubicacion: {
          select: {
            codigoCompleto: true,
            almacen: { select: { nombre: true } },
          },
        },
      },
    });

    const totalStock = lotes.reduce((sum, lote) => sum + lote.cantidad, 0);
    return { productoId, totalStock, ubicaciones: lotes };
  }
}