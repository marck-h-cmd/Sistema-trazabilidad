import { EstadoLote } from '@prisma/client';

export interface LotDTO {
  id: string;
  codigo: string;
  productoId: string;
  producto?: {
    id: string;
    nombre: string;
    sku: string;
  };
  cantidad: number;
  cantidadInicial: number;
  unidadMedida: string;
  fechaProduccion: Date | null;
  fechaCaducidad: Date | null;
  fechaRecepcion: Date | null;
  fechaEnvasado: Date | null;
  estado: EstadoLote;
  almacenId: string | null;
  ubicacionId: string | null;
  ubicacion?: {
    id: string;
    codigoCompleto: string;
  };
  lotePadreId: string | null;
  numeroLoteProveedor: string | null;
  metadatos: Record<string, any> | null;
  observaciones: string | null;
  creadoPor: string;
  creadoEn: Date;
}

export interface CreateLotDTO {
  codigo?: string;
  productoId: string;
  cantidad: number;
  unidadMedida: string;
  fechaProduccion?: Date;
  fechaCaducidad?: Date;
  fechaRecepcion?: Date;
  ubicacionId?: string;
  almacenId?: string;
  lotePadreId?: string;
  numeroLoteProveedor?: string;
  observaciones?: string;
  metadatos?: Record<string, any>;
}

export interface UpdateLotDTO {
  cantidad?: number;
  estado?: EstadoLote;
  ubicacionId?: string;
  almacenId?: string;
  observaciones?: string;
  metadatos?: Record<string, any>;
}

export interface LotQueryParams {
  page?: number;
  limit?: number;
  productoId?: string;
  estado?: string;
  codigo?: string;
  ubicacionId?: string;
  fechaCaducidadDesde?: string;
  fechaCaducidadHasta?: string;
  search?: string;
}