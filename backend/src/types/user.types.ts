import { RolUsuario, EstadoUsuario } from '@prisma/client';

export interface UserDTO {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  telefono: string | null;
  avatar: string | null;
  ultimoInicioSesion: Date | null;
  forzarCambioContrasena: boolean;
  configuracionEscaneo: Record<string, string> | null;
  creadoEn: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  telefono?: string;
}

export interface UpdateUserDTO {
  nombre?: string;
  apellido?: string;
  rol?: RolUsuario;
  estado?: EstadoUsuario;
  telefono?: string;
  forzarCambioContrasena?: boolean;
  configuracionEscaneo?: Record<string, string>;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  rol?: string;
  estado?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}