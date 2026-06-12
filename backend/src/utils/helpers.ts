import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export function generateCode(prefix: string, date: Date, sequence: number, length = 2): string {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const seq = sequence.toString().padStart(length, '0');
  return `${prefix}${year}${month}${day}${seq}`;
}

export function sanitizeUser(user: any) {
  const { contrasena, ...safeUser } = user;
  return safeUser;
}

export function calculateExpiryDate(productionDate: Date, shelfLifeDays: number): Date {
  const expiry = new Date(productionDate);
  expiry.setDate(expiry.getDate() + shelfLifeDays);
  return expiry;
}

export function formatApiResponse<T>(
  data: T,
  message?: string,
  pagination?: { page: number; limit: number; total: number; totalPages: number }
) {
  return {
    success: true,
    data,
    message,
    pagination,
  };
}

export function formatApiError(code: string, message: string, details?: unknown) {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}