export interface Reception {
  id: string;
  codigo: string;
  proveedorId: string;
  proveedor?: {
    id: string;
    nombre: string;
    codigo: string;
  };
  metodoEntrada: 'MANUAL' | 'ESCANEO_CODIGO_BARRAS';
  fechaRecepcion: string;
  numeroAlbaran?: string | null;
  numeroFactura?: string | null;
  lotes?: Lot[];
  recibidoPor: string;
  receptor?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  documentos?: Document[];
  estado: string;
  observaciones?: string | null;
  creadoEn: string;
  actualizadoEn?: string;
}

import { Lot } from './lot.types';

export interface CreateReceptionDTO {
  proveedorId: string;
  metodoEntrada?: string;
  numeroAlbaran?: string;
  numeroFactura?: string;
  lotes: CreateReceptionLotDTO[];
  observaciones?: string;
}

export interface CreateReceptionLotDTO {
  productoId: string;
  cantidad: number;
  unidadMedida: string;
  fechaCaducidad?: string;
  ubicacionId?: string;
  numeroLoteProveedor?: string;
  temperaturaLlegada?: number;
}

export interface ReceptionFilters {
  page?: number;
  limit?: number;
  proveedorId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: string;
}