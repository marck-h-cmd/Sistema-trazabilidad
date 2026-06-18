export interface FullTraceability {
  lote: TraceabilityLot;
  trazabilidadHaciaAtras: BackwardTraceItem[];
  trazabilidadHaciaAdelante: ForwardTraceItem[];
  lineaTiempo: TimelineItem[];
}

export interface TraceabilityLot {
  id: string;
  codigo: string;
  producto: {
    id: string;
    nombre: string;
    sku: string;
    descripcion?: string | null;
  };
  cantidad: number;
  cantidadInicial: number;
  unidadMedida: string;
  fechaProduccion?: string | null;
  fechaCaducidad?: string | null;
  fechaRecepcion?: string | null;
  estado: string;
  ubicacionActual?: {
    almacen: string;
    ubicacion: string;
    codigoCompleto: string;
  } | null;
}

export interface BackwardTraceItem {
  materiaPrima: {
    id: string;
    nombre: string;
    sku: string;
  };
  loteMateriaPrima: {
    id: string;
    codigo: string;
  };
  proveedor: {
    id: string;
    nombre: string;
    codigo: string;
  };
  cantidadUtilizada: number;
  unidadMedida: string;
  fechaRecepcion: string;
  numeroLoteProveedor?: string | null;
}

export interface ForwardTraceItem {
  cliente: {
    id: string;
    nombre: string;
    codigo: string;
    tipo: string;
  };
  expedicion: {
    id: string;
    codigo: string;
    fechaEnvio?: string | null;
    estado: string;
  };
  cantidadEnviada: number;
  unidadMedida: string;
  fechaPrevistaEntrega?: string | null;
}

export interface TimelineItem {
  fecha: string;
  tipo: 'RECEPCION' | 'PRODUCCION' | 'MOVIMIENTO' | 'EXPEDICION' | 'ALERTA';
  descripcion: string;
  detalles: {
    cantidad: number;
    unidad: string;
    origen?: string | null;
    destino?: string | null;
  };
  usuario: string;
}

export interface PublicTraceability {
  producto: {
    nombre: string;
    descripcion?: string | null;
    categoria: string;
  };
  lote: {
    codigo: string;
    fechaProduccion?: string | null;
    fechaCaducidad?: string | null;
    fechaEnvasado?: string | null;
  };
  ingredientes: string[];
  alergenos: string[];
  informacionNutricional?: Record<string, string> | null;
  sellosCalidad: string[];
}