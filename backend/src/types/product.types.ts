import { CategoriaProducto } from '@prisma/client';

export interface ProductDTO {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string | null;
  categoria: CategoriaProducto;
  unidadMedida: string;
  vidaUtilDias: number;
  requiereCadenaFrio: boolean;
  temperaturaMinima: number | null;
  temperaturaMaxima: number | null;
  configuracionLote: Record<string, any> | null;
  activo: boolean;
  creadoEn: Date;
}

export interface CreateProductDTO {
  sku: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaProducto;
  unidadMedida: string;
  vidaUtilDias: number;
  requiereCadenaFrio?: boolean;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
  configuracionLote?: Record<string, any>;
}

export interface UpdateProductDTO {
  nombre?: string;
  descripcion?: string;
  categoria?: CategoriaProducto;
  unidadMedida?: string;
  vidaUtilDias?: number;
  requiereCadenaFrio?: boolean;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
  configuracionLote?: Record<string, any>;
  activo?: boolean;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  categoria?: string;
  search?: string;
  activo?: boolean;
}