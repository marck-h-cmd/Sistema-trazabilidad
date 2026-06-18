'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PaginationProps {
  /** Página actual (indexado desde 1) */
  currentPage: number;
  /** Cantidad total de páginas */
  totalPages: number;
  /** Cantidad de registros por página */
  pageSize: number;
  /** Cantidad total de registros */
  totalItems: number;
  /** Callback al cambiar de página */
  onPageChange: (page: number) => void;
  /** Callback opcional al cambiar el tamaño de página */
  onPageSizeChange?: (pageSize: number) => void;
  /** Opciones disponibles para el tamaño de página (default: [10, 20, 50, 100]) */
  pageSizeOptions?: number[];
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente Pagination
 * Barra de navegación y paginación táctil y responsiva para grillas y tablas.
 */
export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: PaginationProps) {
  const fromRecord = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const toRecord = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 border-t dark:border-gray-800',
        className
      )}
    >
      {/* Texto de información (Oculto en móviles extremadamente pequeños) */}
      <div className="text-xs text-muted-foreground font-medium text-center sm:text-left dark:text-gray-400">
        {totalItems > 0 ? (
          <>
            Mostrando <span className="font-bold text-foreground">{fromRecord}</span> a{' '}
            <span className="font-bold text-foreground">{toRecord}</span> de{' '}
            <span className="font-bold text-foreground">{totalItems}</span> registros
          </>
        ) : (
          'Sin registros'
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        {/* Tamaño de página (Select) */}
        {onPageSizeChange && totalItems > 0 && (
          <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-muted-foreground dark:text-gray-400">
            <span>Mostrar</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-8 w-[70px] rounded-lg dark:border-gray-700">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)} className="text-xs cursor-pointer">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>por página</span>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex items-center space-x-1.5">
          {/* Ir a la primera página */}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="hidden sm:inline-flex h-8 w-8 rounded-lg dark:border-gray-700"
            title="Primera página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Página anterior */}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-8 w-8 rounded-lg dark:border-gray-700"
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Indicador de página compacta */}
          <div className="text-xs font-bold text-foreground px-3 py-1 bg-muted rounded-lg dark:bg-gray-800 dark:text-gray-200">
            {currentPage} / {Math.max(totalPages, 1)}
          </div>

          {/* Siguiente página */}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-8 w-8 rounded-lg dark:border-gray-700"
            title="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Ir a la última página */}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="hidden sm:inline-flex h-8 w-8 rounded-lg dark:border-gray-700"
            title="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
