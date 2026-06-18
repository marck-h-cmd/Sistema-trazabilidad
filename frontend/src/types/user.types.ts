import { AuthUser } from './auth.types';

export interface User extends AuthUser {
  actualizadoEn?: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: string;
  telefono?: string;
}

export interface UpdateUserDTO {
  nombre?: string;
  apellido?: string;
  rol?: string;
  estado?: string;
  telefono?: string;
  forzarCambioContrasena?: boolean;
  configuracionEscaneo?: Record<string, string>;
}

export interface ScannerConfig {
  recepcion: 'obligatorio' | 'opcional' | 'desactivado';
  produccion: 'obligatorio' | 'opcional' | 'desactivado';
  almacen: 'obligatorio' | 'opcional' | 'desactivado';
  expedicion: 'obligatorio' | 'opcional' | 'desactivado';
}

export interface UserFilters {
  page?: number;
  limit?: number;
  rol?: string;
  estado?: string;
  search?: string;
}