export interface Supplier {
  id: string;
  codigo: string;
  nombre: string;
  nif: string;
  direccion: string;
  ciudad: string;
  pais: string;
  nombreContacto: string;
  emailContacto: string;
  telefonoContacto?: string | null;
  utilizaCodigoBarras: boolean;
  activo: boolean;
  creadoEn: string;
  actualizadoEn?: string;
}

export interface CreateSupplierDTO {
  codigo: string;
  nombre: string;
  nif: string;
  direccion: string;
  ciudad: string;
  pais: string;
  nombreContacto: string;
  emailContacto: string;
  telefonoContacto?: string;
  utilizaCodigoBarras?: boolean;
}

export interface UpdateSupplierDTO extends Partial<CreateSupplierDTO> {
  activo?: boolean;
}

export interface SupplierFilters {
  page?: number;
  limit?: number;
  search?: string;
  activo?: boolean;
}