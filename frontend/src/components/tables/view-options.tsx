'use client';

import * as React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ViewOptionsProps {
  /** Lista de columnas disponibles para mostrar/ocultar */
  columns: {
    id: string;
    label: string;
    visible: boolean;
  }[];
  /** Callback ejecutado al alternar la visibilidad de una columna */
  onToggleColumn: (id: string) => void;
  /** Clase CSS adicional para el botón trigger */
  className?: string;
}

/**
 * Componente ViewOptions
 * Selector desplegable para alternar dinámicamente la visibilidad de las columnas de una tabla.
 */
export function ViewOptions({
  columns,
  onToggleColumn,
  className,
}: ViewOptionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'ml-auto hidden h-10 gap-2 border-muted-foreground/20 rounded-xl lg:flex text-xs font-semibold text-muted-foreground hover:text-foreground dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400',
            className
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Columnas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px] rounded-xl">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider dark:text-gray-400">
          Visibilidad de columnas
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns
          .filter((column) => column.label && column.id)
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="text-xs capitalize cursor-pointer dark:hover:bg-gray-800"
                checked={column.visible}
                onCheckedChange={() => onToggleColumn(column.id)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
