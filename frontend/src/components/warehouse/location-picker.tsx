'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { warehousesApi } from '@/lib/api/warehouses.api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Warehouse as WarehouseIcon, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationPickerProps {
  /** ID de almacén pre-seleccionado o forzado (si se pasa, se oculta/deshabilita el selector de almacén) */
  almacenId?: string | null;
  /** ID de la ubicación seleccionada actualmente (valor controlado) */
  value?: string;
  /** Callback al cambiar la ubicación seleccionada */
  onChange: (locationId: string) => void;
  /** Callback opcional al cambiar de almacén */
  onAlmacenChange?: (almacenId: string) => void;
  /** Deshabilitar la interacción con el picker */
  disabled?: boolean;
  /** Mostrar labels arriba del input */
  showLabels?: boolean;
  /** Clase CSS adicional para el contenedor */
  className?: string;
}

/**
 * Componente LocationPicker
 * Selector de doble nivel (Almacén -> Ubicación) para asignación rápida de posiciones físicas.
 */
export function LocationPicker({
  almacenId,
  value,
  onChange,
  onAlmacenChange,
  disabled = false,
  showLabels = true,
  className,
}: LocationPickerProps) {
  const [selectedAlmacen, setSelectedAlmacen] = React.useState<string>(almacenId || '');

  // Sincronizar almacenId externo
  React.useEffect(() => {
    if (almacenId) {
      setSelectedAlmacen(almacenId);
    }
  }, [almacenId]);

  // Cargar lista de almacenes
  const { data: warehousesResponse, isLoading: isLoadingWarehouses } = useQuery({
    queryKey: ['warehouses', 'picker'],
    queryFn: () => warehousesApi.getAll().then((r) => r.data.data),
    enabled: !almacenId, // Solo cargar si no se fuerza un almacén específico
  });

  const warehouses = React.useMemo(() => {
    return warehousesResponse || [];
  }, [warehousesResponse]);

  // Cargar ubicaciones para el almacén seleccionado
  const { data: locationsResponse, isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations', 'picker', selectedAlmacen],
    queryFn: () => warehousesApi.getLocations(selectedAlmacen).then((r) => r.data.data),
    enabled: !!selectedAlmacen, // Solo cargar si hay un almacén seleccionado
  });

  const locations = React.useMemo(() => {
    return locationsResponse || [];
  }, [locationsResponse]);

  const handleAlmacenSelect = (id: string) => {
    setSelectedAlmacen(id);
    onChange(''); // reset ubicación
    if (onAlmacenChange) onAlmacenChange(id);
  };

  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 w-full text-left', className)}>
      {/* 1. Selector de Almacén (Oculto o bloqueado si almacenId se pasa por props) */}
      {!almacenId && (
        <div className="space-y-2">
          {showLabels && (
            <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5 dark:text-gray-300">
              <WarehouseIcon className="h-4 w-4 text-primary" />
              Almacén
            </Label>
          )}
          <Select
            value={selectedAlmacen}
            onValueChange={handleAlmacenSelect}
            disabled={disabled || isLoadingWarehouses}
          >
            <SelectTrigger className="h-10 rounded-xl dark:border-gray-800 dark:bg-gray-950">
              {isLoadingWarehouses ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  <span>Cargando almacenes...</span>
                </div>
              ) : (
                <SelectValue placeholder="Seleccionar Almacén" />
              )}
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {warehouses.map((wh: any) => (
                <SelectItem key={wh.id} value={wh.id} className="text-xs cursor-pointer">
                  {wh.nombre} ({wh.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 2. Selector de Ubicación */}
      <div className={cn('space-y-2', almacenId && 'sm:col-span-2')}>
        {showLabels && (
          <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5 dark:text-gray-300">
            <MapPin className="h-4 w-4 text-primary" />
            Posición Física / Ubicación
          </Label>
        )}
        <Select
          value={value || ''}
          onValueChange={onChange}
          disabled={disabled || !selectedAlmacen || isLoadingLocations}
        >
          <SelectTrigger className="h-10 rounded-xl dark:border-gray-800 dark:bg-gray-950">
            {isLoadingLocations ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span>Cargando posiciones...</span>
              </div>
            ) : (
              <SelectValue
                placeholder={
                  !selectedAlmacen
                    ? 'Seleccione primero un almacén'
                    : locations.length === 0
                    ? 'Sin ubicaciones en este almacén'
                    : 'Seleccionar Ubicación'
                }
              />
            )}
          </SelectTrigger>
          <SelectContent className="rounded-xl max-h-[200px]">
            {locations
              .filter((loc: any) => loc.activo)
              .map((loc: any) => (
                <SelectItem key={loc.id} value={loc.id} className="text-xs cursor-pointer">
                  {loc.codigoCompleto} (Cap: {loc.capacidadActual || 0}/{loc.capacidadMaxima || '∞'})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
