export interface Production {
  id: string;
  loteId: string;
  lote?: {
    id: string;
    codigo: string;
    producto?: {
      id: string;
      nombre: string;
      sku: string;
    };
    cantidad?: number;
    unidadMedida?: string;
    estado?: string;
  };
  lineaProduccionId: string;
  lineaProduccion?: {
    id: string;
    codigo: string;
    nombre: string;
  };
  temperaturaHorno?: number | null;
  tiempoCoccion?: number | null;
  humedad?: number | null;
  tamanoLote?: number | null;
  rendimiento?: number | null;
  materiasPrimas?: ProductionRawMaterial[];
  operarioId: string;
  operario?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  fechaInicio: string;
  fechaFin?: string | null;
  etiquetasImpresas: boolean;
  tipoEtiqueta: 'CODE_128' | 'QR' | 'AMBOS';
  cantidadEtiquetas: number;
  documentos?: Document[];
  observaciones?: string | null;
  creadoPor?: string;
  creadoEn: string;
  actualizadoEn?: string;
}

export interface ProductionRawMaterial {
  id: string;
  loteId: string;
  lote?: {
    id: string;
    codigo: string;
    producto?: {
      id: string;
      nombre: string;
    };
  };
  proveedorId: string;
  proveedor?: {
    id: string;
    nombre: string;
  };
  cantidad: number;
  unidadMedida: string;
}

export interface CreateProductionDTO {
  lineaProduccionId: string;
  productoId: string;
  materiasPrimas: {
    loteId: string;
    cantidad: number;
  }[];
  temperaturaHorno?: number;
  tiempoCoccion?: number;
  humedad?: number;
  tamanoLote?: number;
  observaciones?: string;
  tipoEtiqueta?: string;
  cantidadEtiquetas?: number;
}

export interface UpdateProductionDTO {
  temperaturaHorno?: number;
  tiempoCoccion?: number;
  humedad?: number;
  etiquetasImpresas?: boolean;
  observaciones?: string;
}

export interface ProductionFilters {
  page?: number;
  limit?: number;
  lineaProduccionId?: string;
  productoId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
}