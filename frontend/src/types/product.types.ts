export interface Product {
  id: string;
  sku: string;
  nombre: string;
  descripcion?: string | null;
  categoria: 'MATERIA_PRIMA' | 'PRODUCTO_TERMINADO' | 'ENVASE' | 'SEMIELABORADO';
  unidadMedida: string;
  vidaUtilDias: number;
  requiereCadenaFrio: boolean;
  temperaturaMinima?: number | null;
  temperaturaMaxima?: number | null;
  configuracionLote?: LotConfig | null;
  activo: boolean;
  lineasProduccionProductos?: ProductionLineProduct[];
  plantillasEtiquetas?: LabelTemplate[];
  creadoEn: string;
  actualizadoEn?: string;
}

export interface LotConfig {
  prefijo?: string;
  incluirFecha?: boolean;
  incluirLinea?: boolean;
  incluirTurno?: boolean;
  correlativoLongitud?: number;
}

export interface ProductionLineProduct {
  id: string;
  lineaProduccionId: string;
  lineaProduccion?: ProductionLine;
  productoId: string;
  esPorDefecto: boolean;
  tiempoProduccion?: number;
}

export interface ProductionLine {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  codigoBarras?: string;
  activo: boolean;
}

export interface LabelTemplate {
  id: string;
  nombre: string;
  productoId: string;
  tipo: 'CODE_128' | 'QR' | 'AMBOS';
  anchoMm: number;
  altoMm: number;
  camposIncluidos: string[];
  plantillaHtml?: string;
  activo: boolean;
}

export interface CreateProductDTO {
  sku: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  unidadMedida: string;
  vidaUtilDias: number;
  requiereCadenaFrio?: boolean;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
  configuracionLote?: LotConfig;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  activo?: boolean;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  categoria?: string;
  search?: string;
  activo?: boolean;
}

export interface StockSummary {
  productoId: string;
  totalStock: number;
  ubicaciones: StockLocation[];
}

export interface StockLocation {
  cantidad: number;
  ubicacion: {
    codigoCompleto: string;
    almacen: {
      nombre: string;
    };
  };
}