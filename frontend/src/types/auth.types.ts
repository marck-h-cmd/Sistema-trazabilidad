export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  estado: string;
  telefono?: string | null;
  avatar?: string | null;
  ultimoInicioSesion?: string | null;
  forzarCambioContrasena?: boolean;
  configuracionEscaneo?: Record<string, string> | null;
  clienteId?: string | null;
  proveedorId?: string | null;
  creadoEn?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface TokenPayload {
  id: string;
  email: string;
  rol: string;
  nombre: string;
  apellido: string;
  iat?: number;
  exp?: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}