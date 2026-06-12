import { PaginationDTO } from './validators';

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function getPaginationParams(query: PaginationDTO): PaginationResult {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit };
}

export function getPaginationMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}