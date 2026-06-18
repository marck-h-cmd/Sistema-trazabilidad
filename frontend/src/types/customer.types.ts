export interface Customer {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  nif: string;
  direccion: string;
  ciudad: string;
  pais: string;
  nombreContacto: string;
  emailContacto: string;
  telefonoContacto?: string | null;
  direccionEnvio?: string | null;
  activo: boolean;
  creadoEn: string;
  actualizadoEn?: string;
}

export interface CreateCustomerDTO {
  codigo: string;
  nombre: string;
  tipo: string;
  nif: string;
  direccion: string;
  ciudad: string;
  pais: string;
  nombreContacto: string;
  emailContacto: string;
  telefonoContacto?: string;
  direccionEnvio?: string;
}

export interface UpdateCustomerDTO extends Partial<CreateCustomerDTO> {
  activo?: boolean;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: string;
  activo?: boolean;
}