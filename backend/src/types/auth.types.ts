import { RolUsuario } from '@prisma/client';

export interface TokenPayload {
  id: string;
  email: string;
  rol: RolUsuario;
  nombre: string;
  apellido: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: RolUsuario;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  estado: string;
  telefono?: string | null;
  avatar?: string | null;
}