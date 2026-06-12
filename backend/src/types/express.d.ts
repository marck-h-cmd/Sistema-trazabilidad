import { RolUsuario } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        rol: RolUsuario;
        nombre: string;
        apellido: string;
      };
      token?: string;
      requestId?: string;
    }
  }
}

export {};