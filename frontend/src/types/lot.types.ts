import { Production } from './production.types';
import { ShipmentItem } from './shipment.types';
import { Alert } from './alert.types';
import { Location } from './warehouse.types';

export interface Lot {
  id: string;
  codigo: string;
  productoId: string;
  producto?: {
    id: string;
    nombre: string;
    sku: string;
    categoria?: string;
    descripcion?: string | null;
  };
  cantidad: number;
  cantidadInicial: number;
  unidadMedida: string;
  fechaProduccion?: string | null;
  fechaCaducidad?: string | null;
  fechaRecepcion?: string | null;
  fechaEnvasado?: string | null;
  estado: LotStatus;
  almacenId?: string | null;
  almacen?: {
    id: string;
    nombre: string;
    codigo: string;
  } | null;
  ubicacionId?: string | null;
  ubicacion?: {
    id: string;
    codigoCompleto: string;
    codigoBarras?: string | null;
  } | null;
  lotePadreId?: string | null;
  lotePadre?: Lot | null;
  lotesHijos?: Lot[];
  materiasPrimas?: RawMaterial[];
  produccion?: Production | null;
  movimientos?: LotMovement[];
  itemsExpedicion?: ShipmentItem[];
  alertas?: Alert[];
  numeroLoteProveedor?: string | null;
  metadatos?: Record<string, any> | null;
  observaciones?: string | null;
  creadoPor?: string;
  creadoEn: string;
  actualizadoEn?: string;
}

export type LotStatus =
  | 'ACTIVO'
  | 'RESERVADO'
  | 'EN_PRODUCCION'
  | 'EN_TRANSITO'
  | 'ENTREGADO'
  | 'VENCIDO'
  | 'BLOQUEADO'
  | 'RETIRADO'
  | 'CONSUMIDO';

export interface RawMaterial {
  id: string;
  loteId: string;
  lote?: Lot;
  proveedorId: string;
  proveedor?: {
    id: string;
    nombre: string;
    codigo: string;
  };
  codigoLoteProveedor?: string;
  numeroFactura?: string;
  numeroAlbaran?: string;
  cantidad: number;
  unidadMedida: string;
  fechaRecepcion: string;
  fechaCaducidad?: string;
  temperaturaLlegada?: number;
  controlCalidadAprobado?: boolean;
  observacionesCalidad?: string;
  produccionId?: string;
}

export interface LotMovement {
  id: string;
  loteId: string;
  lote?: Lot;
  tipo: MovementType;
  ubicacionOrigenId?: string;
  ubicacionOrigen?: Location | null;
  ubicacionDestinoId?: string;
  ubicacionDestino?: Location | null;
  cantidad: number;
  unidadMedida: string;
  referenciaId?: string;
  referenciaTipo?: string;
  realizadoPor?: string;
  usuario?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  observaciones?: string;
  creadoEn: string;
}

export type MovementType =
  | 'RECEPCION'
  | 'PRODUCCION'
  | 'MOVIMIENTO_INTERNO'
  | 'EXPEDICION'
  | 'DEVOLUCION'
  | 'AJUSTE'
  | 'CONSUMO'
  | 'MERMA';

export interface CreateLotDTO {
  productoId: string;
  cantidad: number;
  unidadMedida: string;
  fechaProduccion?: string;
  fechaCaducidad?: string;
  ubicacionId?: string;
  almacenId?: string;
  numeroLoteProveedor?: string;
  observaciones?: string;
}

export interface UpdateLotDTO {
  cantidad?: number;
  estado?: LotStatus;
  ubicacionId?: string;
  almacenId?: string;
  observaciones?: string;
}

export interface LotFilters {
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