import { ProductRepository } from '@repositories/product.repository';
import { ApiError } from '@utils/errors';
import { CreateProductDTO, UpdateProductDTO, ProductQueryParams } from '@customTypes/product.types';
import { getPaginationParams, getPaginationMeta } from '@utils/pagination';
import { Prisma, CategoriaProducto } from '@prisma/client';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async findAll(query: ProductQueryParams) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: Prisma.ProductoWhereInput = {};

    if (query.categoria) {
      where.categoria = query.categoria as CategoriaProducto;
    }

    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { descripcion: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.activo !== undefined) {
      where.activo = query.activo;
    }

    const { products, total } = await this.productRepository.findAll({
      skip,
      take,
      where,
    });

    return {
      data: products,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw ApiError.notFound('Producto no encontrado');
    }

    return product;
  }

  async create(data: CreateProductDTO) {
    const existing = await this.productRepository.findBySku(data.sku);

    if (existing) {
      throw ApiError.conflict('Ya existe un producto con ese SKU');
    }

    return this.productRepository.create({
      sku: data.sku,
      nombre: data.nombre,
      descripcion: data.descripcion,
      categoria: data.categoria as CategoriaProducto,
      unidadMedida: data.unidadMedida,
      vidaUtilDias: data.vidaUtilDias,
      requiereCadenaFrio: data.requiereCadenaFrio || false,
      temperaturaMinima: data.temperaturaMinima,
      temperaturaMaxima: data.temperaturaMaxima,
      configuracionLote: data.configuracionLote,
    });
  }

  async update(id: string, data: UpdateProductDTO) {
    await this.findById(id);

    return this.productRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);

    return this.productRepository.update(id, { activo: false });
  }

  async findByCategory(categoria: string) {
    return this.productRepository.findByCategory(categoria as CategoriaProducto);
  }

  async getStockSummary(productoId: string) {
    await this.findById(productoId);
    return this.productRepository.getStockSummary(productoId);
  }
}