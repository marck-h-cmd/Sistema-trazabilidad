export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface DateRangeFilter {
  fechaInicio?: string;
  fechaFin?: string;
}

export interface SearchFilter {
  search?: string;
}

export type BaseQueryParams = PaginationParams & DateRangeFilter & SearchFilter;