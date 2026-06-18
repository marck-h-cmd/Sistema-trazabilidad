'use client';

import * as React from 'react';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  /** Clave única del filtro */
  key: string;
  /** Etiqueta descriptiva para el selector */
  label: string;
  /** Valor seleccionado actualmente */
  value: string;
  /** Lista de opciones de selección */
  options: FilterOption[];
  /** Callback al cambiar la selección */
  onChange: (value: string) => void;
}

interface TableFiltersProps {
  /** Valor del buscador de texto */
  searchQuery?: string;
  /** Callback al cambiar el buscador de texto */
  onSearchQueryChange?: (value: string) => void;
  /** Marcador de posición del input de búsqueda */
  searchPlaceholder?: string;
  /** Listado de selectores de filtro opcionales */
  filters?: FilterConfig[];
  /** Callback al hacer clic en restablecer/limpiar filtros */
  onReset?: () => void;
  /** Forzar mostrar u ocultar botón de limpieza */
  showReset?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente TableFilters
 * Barra de filtrado superior con búsqueda textual integrada, selectores múltiples
 * y acción de limpieza rápida.
 */
export function TableFilters({
  searchQuery,
  onSearchQueryChange,
  searchPlaceholder = 'Buscar...',
  filters = [],
  onReset,
  showReset,
  className,
}: TableFiltersProps) {
  // Determinar si hay filtros activos para mostrar el botón de limpieza
  const hasActiveFilters = React.useMemo(() => {
    if (showReset !== undefined) return showReset;

    const hasSearch = searchQuery !== undefined && searchQuery !== '';
    const hasSelects = filters.some((f) => f.value && f.value !== 'ALL' && f.value !== '');

    return hasSearch || hasSelects;
  }, [searchQuery, filters, showReset]);

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row items-center gap-3 w-full bg-white dark:bg-gray-900/10 p-1 rounded-2xl',
        className
      )}
    >
      {/* Buscador de texto */}
      {onSearchQueryChange && searchQuery !== undefined && (
        <div className="w-full md:flex-1">
          <SearchInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={onSearchQueryChange}
            className="w-full"
          />
        </div>
      )}

      {/* Selectores de filtros dinámicos */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {filters.map((filter) => (
            <div key={filter.key} className="w-full sm:w-[160px] md:w-[150px] lg:w-[160px]">
              <Select value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger className="h-10 rounded-xl dark:border-gray-800">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      {/* Botón de limpiar filtros */}
      {hasActiveFilters && onReset && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-10 text-xs gap-1.5 font-semibold text-muted-foreground hover:text-destructive dark:hover:bg-red-950/20 rounded-xl w-full md:w-auto shrink-0 transition-colors animate-fade-in"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restablecer
        </Button>
      )}
    </div>
  );
}
