'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Título de la cabecera de columna */
  title: string;
  /** Clave por la que se ordena esta columna */
  sortKey?: string;
  /** Clave de ordenación activa actualmente en la tabla */
  currentSortKey?: string;
  /** Dirección de ordenación activa: 'asc', 'desc' o null */
  currentSortOrder?: 'asc' | 'desc' | null;
  /** Callback al cambiar el ordenamiento */
  onSort?: (key: string, order: 'asc' | 'desc' | null) => void;
  /** Callback opcional para ocultar la columna directamente desde la cabecera */
  onHide?: () => void;
}

/**
 * Componente ColumnHeader
 * Cabecera de columna de tabla reutilizable con controles interactivos de ordenación (ASC/DESC)
 * y opción de ocultar columna.
 */
export function ColumnHeader({
  title,
  sortKey,
  currentSortKey,
  currentSortOrder,
  onSort,
  onHide,
  className,
}: ColumnHeaderProps) {
  const isSorted = sortKey && currentSortKey === sortKey;

  const handleSortAsc = () => {
    if (onSort && sortKey) onSort(sortKey, 'asc');
  };

  const handleSortDesc = () => {
    if (onSort && sortKey) onSort(sortKey, 'desc');
  };

  const handleToggleSort = () => {
    if (!onSort || !sortKey) return;
    if (!isSorted || currentSortOrder === null) {
      onSort(sortKey, 'asc');
    } else if (currentSortOrder === 'asc') {
      onSort(sortKey, 'desc');
    } else {
      onSort(sortKey, null);
    }
  };

  // Si no es ordenable, simplemente mostrar el título plano
  if (!sortKey || !onSort) {
    return <div className={cn('text-xs font-semibold text-muted-foreground dark:text-gray-400', className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 data-[state=open]:bg-accent px-1.5 -ml-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span>{title}</span>
            {isSorted && currentSortOrder === 'asc' ? (
              <ArrowUp className="ml-2 h-3.5 w-3.5 text-primary" />
            ) : isSorted && currentSortOrder === 'desc' ? (
              <ArrowDown className="ml-2 h-3.5 w-3.5 text-primary" />
            ) : (
              <ChevronsUpDown className="ml-2 h-3.5 w-3.5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44 rounded-xl">
          <DropdownMenuItem
            onClick={handleSortAsc}
            className="flex items-center gap-2 cursor-pointer text-xs dark:hover:bg-gray-800"
          >
            <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
            Ascendente
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleSortDesc}
            className="flex items-center gap-2 cursor-pointer text-xs dark:hover:bg-gray-800"
          >
            <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
            Descendente
          </DropdownMenuItem>
          {onHide && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onHide}
                className="flex items-center gap-2 cursor-pointer text-xs text-destructive focus:text-destructive dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <EyeOff className="h-3.5 w-3.5" />
                Ocultar Columna
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
