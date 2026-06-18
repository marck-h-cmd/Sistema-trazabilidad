'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ColumnHeader } from './column-header';
import { Pagination } from './pagination';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ColumnConfig<T> {
  /** Identificador único de la columna o alias key */
  id?: string;
  key?: string;
  /** Título de cabecera de la columna or alias header */
  label?: string;
  header?: string;
  /** Campo del objeto a renderizar, o función personalizada que devuelve ReactNode */
  accessor?: keyof T | ((row: T, index: number, onEdit?: any, onDelete?: any) => React.ReactNode);
  cell?: (row: T, index: number, onEdit?: any, onDelete?: any) => React.ReactNode;
  /** Permite ordenar la columna */
  sortable?: boolean;
  /** Clave opcional para realizar el sort en la API */
  sortKey?: string;
  /** Indica si la columna está visible (default: true) */
  visible?: boolean;
  /** Alineación del texto en la cabecera y celdas */
  align?: 'left' | 'center' | 'right';
  /** Clase CSS adicional para la celda de la cabecera y cuerpo */
  className?: string;
}

interface DataTableProps<T> {
  /** Listado de columnas configuradas para la tabla */
  columns: ColumnConfig<T>[];
  /** Array de datos a listar */
  data: T[];
  /** Indica si los datos están cargando (muestra skeletons de tabla) */
  isLoading?: boolean;
  /** Identificador para la fila (default: 'id') */
  rowIdKey?: keyof T;
  /** Título de estado vacío cuando no hay registros */
  emptyStateTitle?: string;
  /** Descripción del estado vacío */
  emptyStateDescription?: string;
  /** Icono personalizado del estado vacío */
  emptyStateIcon?: React.ReactNode;
  /** Acción de estado vacío */
  emptyStateAction?: {
    label: string;
    onClick: () => void;
  };
  /** Callback al hacer clic en una fila */
  onRowClick?: (row: T) => void;
  /** Clave de ordenación activa */
  sortKey?: string;
  /** Sentido de ordenación activo: 'asc', 'desc' o null */
  sortOrder?: 'asc' | 'desc' | null;
  /** Callback al cambiar de ordenamiento */
  onSortChange?: (key: string, order: 'asc' | 'desc' | null) => void;
  /** Configuración de paginación opcional */
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];
  };
  /** Props directas de paginación (compatibilidad) */
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  /** Acciones adicionales pasadas a la celda */
  extraActions?: {
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    [key: string]: any;
  };
  /** Clase CSS adicional para el wrapper principal */
  className?: string;
}

/**
 * Componente DataTable
 * Grilla de datos genérica y premium que implementa cabeceras ordenables, paginación,
 * selección de columnas ocultas, estados de carga mediante skeletons y contención táctil.
 */
export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  rowIdKey = 'id' as keyof T,
  emptyStateTitle = 'No se encontraron registros',
  emptyStateDescription = 'No hay información disponible para mostrar en esta grilla.',
  emptyStateIcon,
  emptyStateAction,
  onRowClick,
  sortKey,
  sortOrder,
  onSortChange,
  pagination,
  page,
  totalPages,
  onPageChange,
  extraActions,
  className,
}: DataTableProps<T>) {
  // Filtrar columnas visibles
  const visibleColumns = React.useMemo(() => {
    return columns.filter((col) => col.visible !== false);
  }, [columns]);

  const onEdit = extraActions?.onEdit;
  const onDelete = extraActions?.onDelete;

  const renderCellContent = (row: T, column: ColumnConfig<T>, index: number) => {
    if (column.cell) {
      return column.cell(row, index, onEdit, onDelete);
    }
    const accessor = column.accessor;
    if (typeof accessor === 'function') {
      return accessor(row, index, onEdit, onDelete);
    }
    if (accessor) {
      const val = row[accessor];
      if (val === null || val === undefined) return '';
      return String(val);
    }
    const key = column.key;
    if (key) {
      const val = (row as any)[key];
      if (val === null || val === undefined) return '';
      return String(val);
    }
    return '';
  };

  const getRowId = (row: T, index: number): string => {
    const idVal = row[rowIdKey];
    if (idVal) return String(idVal);
    return `row-${index}`;
  };

  // Combinar paginación
  const finalPagination = React.useMemo(() => {
    if (pagination) return pagination;
    if (page !== undefined && totalPages !== undefined && onPageChange) {
      return {
        currentPage: page,
        totalPages: totalPages,
        pageSize: 10,
        totalItems: totalPages * 10,
        onPageChange: onPageChange,
      };
    }
    return undefined;
  }, [pagination, page, totalPages, onPageChange]);

  return (
    <div className={cn('w-full border rounded-2xl bg-white shadow-sm overflow-hidden dark:bg-gray-900/40 dark:border-gray-800 animate-fade-in', className)}>
      <div className="relative w-full overflow-x-auto">
        <Table className="w-full border-none">
          {/* Cabecera */}
          <TableHeader className="bg-muted/50 border-b dark:bg-gray-900/40">
            <TableRow className="border-b dark:border-gray-800">
              {visibleColumns.map((col, colIndex) => {
                const colId = col.id || col.key || `col-${colIndex}`;
                const colLabel = col.label || col.header || '';
                const alignmentClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : 'text-left';

                return (
                  <TableHead
                    key={colId}
                    className={cn(
                      'h-12 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground vertical-middle select-none',
                      alignmentClass,
                      col.className
                    )}
                  >
                    <ColumnHeader
                      title={colLabel}
                      sortKey={col.sortable ? col.sortKey || (typeof col.accessor === 'string' ? String(col.accessor) : colId) : undefined}
                      currentSortKey={sortKey}
                      currentSortOrder={sortOrder}
                      onSort={onSortChange}
                      className={cn(
                        col.align === 'center' && 'justify-center',
                        col.align === 'right' && 'justify-end'
                      )}
                    />
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          {/* Cuerpo de la Tabla */}
          <TableBody>
            {isLoading ? (
              // Skeletons de carga dentro de la tabla
              Array.from({ length: finalPagination?.pageSize || 5 }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`} className="border-b dark:border-gray-800/50 hover:bg-transparent">
                  {visibleColumns.map((col, colIndex) => (
                    <TableCell key={`skeleton-cell-${colIndex}`} className="p-4">
                      <div
                        className={cn(
                          'h-4 bg-muted rounded animate-pulse dark:bg-gray-800',
                          col.align === 'center' && 'mx-auto w-1/2',
                          col.align === 'right' && 'ml-auto w-3/4',
                          col.align === 'left' && 'w-3/4'
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length > 0 ? (
              // Datos cargados
              data.map((row, rowIndex) => (
                <TableRow
                  key={getRowId(row, rowIndex)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    'border-b dark:border-gray-800 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-muted/40 dark:hover:bg-gray-800/30'
                  )}
                >
                  {visibleColumns.map((col) => {
                    const alignmentClass =
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left';

                    return (
                      <TableCell
                        key={col.id || col.key}
                        className={cn(
                          'p-4 text-sm align-middle truncate max-w-[280px]',
                          alignmentClass,
                          col.className
                        )}
                      >
                        {renderCellContent(row, col, rowIndex)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              // Estado Vacío
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={visibleColumns.length} className="h-48 p-0 text-center">
                  <EmptyState
                    icon={emptyStateIcon || <PackageOpen className="h-10 w-10 text-muted-foreground" />}
                    title={emptyStateTitle}
                    description={emptyStateDescription}
                    action={emptyStateAction}
                    className="py-12"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {finalPagination && data.length > 0 && (
        <Pagination
          currentPage={finalPagination.currentPage}
          totalPages={finalPagination.totalPages}
          pageSize={finalPagination.pageSize}
          totalItems={finalPagination.totalItems}
          onPageChange={finalPagination.onPageChange}
          onPageSizeChange={finalPagination.onPageSizeChange}
          pageSizeOptions={finalPagination.pageSizeOptions}
        />
      )}
    </div>
  );
}
