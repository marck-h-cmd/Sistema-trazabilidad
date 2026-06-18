export interface Warehouse {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  tipo: string;
  activo: boolean;
  ubicaciones?: Location[];
  creadoEn: string;
  actualizadoEn?: string;
}

export interface Location {
  id: string;
  almacenId: string;
  almacen?: Warehouse;
  zona: string;
  pasillo: string;
  estanteria: string;
  nivel: string;
  codigoBarras?: string | null;
  codigoCompleto: string;
  capacidadMaxima?: number | null;
  capacidadActual: number;
  activo: boolean;
}

export interface CreateWarehouseDTO {
  codigo: string;
  nombre: string;
  direccion: string;
  tipo?: string;
}

export interface UpdateWarehouseDTO extends Partial<CreateWarehouseDTO> {
  activo?: boolean;
}

export interface CreateLocationDTO {
  almacenId: string;
  zona: string;
  pasillo: string;
  estanteria: string;
  nivel: string;
  codigoBarras?: string;
  capacidadMaxima?: number;
}

export interface WarehouseFilters {
  page?: number;
  limit?: number;
  search?: string;
}