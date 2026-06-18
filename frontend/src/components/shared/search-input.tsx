'use client';

import * as React from 'react';
import { Search, X, Loader2, QrCode } from 'lucide-react';
import { Input, InputProps } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchInputProps extends Omit<InputProps, 'onChange'> {
  /** Valor de búsqueda actual (modo controlado) */
  value?: string;
  /** Callback ejecutado al cambiar el texto de búsqueda */
  onChange?: (value: string) => void;
  /** Callback ejecutado al presionar Enter o confirmar la búsqueda */
  onSearch?: (value: string) => void;
  /** Indica si se está realizando una búsqueda en segundo plano (muestra spinner) */
  isLoading?: boolean;
  /** Mostrar un botón de escaneo QR integrado en la barra de búsqueda */
  showScanButton?: boolean;
  /** Callback al hacer clic en el botón de escaneo integrado */
  onScanClick?: () => void;
  /** Retardo de rebote (debounce) en ms para llamar a onSearch al escribir (por defecto desactivado) */
  debounceMs?: number;
}

/**
 * Componente SearchInput
 * Barra de búsqueda premium con soporte para botón de escaneo, borrado rápido y cargador dinámico.
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onSearch,
      isLoading = false,
      showScanButton = false,
      onScanClick,
      debounceMs,
      className,
      placeholder = 'Buscar...',
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = React.useState(value || '');
    const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    // Sincronizar valor controlado externo con local
    React.useEffect(() => {
      if (value !== undefined) {
        setLocalValue(value);
      }
    }, [value]);

    // Limpieza de temporizadores de debounce
    React.useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    const triggerSearch = (val: string) => {
      if (onSearch) {
        onSearch(val);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalValue(val);

      if (onChange) {
        onChange(val);
      }

      // Soporte para debounce si se configuró debounceMs
      if (debounceMs && debounceMs > 0) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          triggerSearch(val);
        }, debounceMs);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        triggerSearch(localValue);
      }
    };

    const handleClear = () => {
      setLocalValue('');
      if (onChange) onChange('');
      if (onSearch) onSearch('');
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };

    return (
      <div className={cn('relative flex w-full items-center', className)}>
        {/* Icono de búsqueda al inicio */}
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none dark:text-gray-400" />

        <Input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'pl-9 pr-16 h-10 w-full rounded-xl border border-input bg-background shadow-sm placeholder:text-muted-foreground transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary dark:bg-gray-950 dark:border-gray-800',
            isLoading && 'pr-20'
          )}
          ref={ref}
          {...props}
        />

        {/* Grupo de acciones del final (Loader, Clear, Scan) */}
        <div className="absolute right-1.5 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-1" />
          )}

          {localValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground dark:hover:bg-gray-800"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {showScanButton && onScanClick && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onScanClick}
              className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
              aria-label="Escanear código"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
