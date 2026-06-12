export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'ERROR';
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, code?: string): ApiError {
    return new ApiError(400, message, code || 'BAD_REQUEST');
  }

  static unauthorized(message = 'No autenticado'): ApiError {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'No autorizado'): ApiError {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(message = 'Recurso no encontrado'): ApiError {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message, 'CONFLICT');
  }

  static internal(message = 'Error interno del servidor'): ApiError {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }
}