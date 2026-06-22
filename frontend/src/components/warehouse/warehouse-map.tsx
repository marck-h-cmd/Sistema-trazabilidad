'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { warehousesApi } from '@/lib/api/warehouses.api';
import { Location } from '@/types/warehouse.types';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Map, Grid, Info, AlertTriangle, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WarehouseMapProps {
  /** ID del almacén para el cual se renderiza el mapa */
  warehouseId: string;
  /** Callback al seleccionar una posición/ubicación en el mapa */
  onLocationSelect?: (location: Location) => void;
  /** ID de la ubicación seleccionada actualmente (para resaltar) */
  selectedLocationId?: string;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente WarehouseMap
 * Visualización 2D interactiva de la distribución de estanterías, pasillos y niveles de un almacén.
 * Permite seleccionar posiciones y visualizar de un vistazo el mapa de calor de ocupación física.
 */
export function WarehouseMap({
  warehouseId,
  onLocationSelect,
  selectedLocationId,
  className,
}: WarehouseMapProps) {
  // Cargar ubicaciones del almacén
  const { data: locationsResponse, isLoading, isError } = useQuery({
    queryKey: ['locations', 'map', warehouseId],
    queryFn: () => warehousesApi.getLocations(warehouseId).then((r) => r.data.data),
    enabled: !!warehouseId,
  });

  const locations = React.useMemo(() => {
    return (locationsResponse as Location[]) || [];
  }, [locationsResponse]);

  // Agrupar ubicaciones por Zona para organizar el mapa en secciones
  const zonesGroup = React.useMemo(() => {
    const groups: Record<string, Location[]> = {};
    locations.forEach((loc) => {
      const zName = loc.zona || 'Principal';
      if (!groups[zName]) {
        groups[zName] = [];
      }
      groups[zName].push(loc);
    });
    return groups;
  }, [locations]);

  // Obtener color según ocupación de la celda
  const getOccupancyColor = (loc: Location) => {
    if (!loc.activo) return 'bg-gray-200 border-gray-300 dark:bg-gray-800 dark:border-gray-700 cursor-not-allowed opacity-40';

    const max = loc.capacidadMaxima || 0;
    const current = loc.capacidadActual || 0;

    if (max <= 0) return 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/50';

    const ratio = current / max;

    if (ratio >= 0.9) {
      return 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/50';
    }
    if (ratio >= 0.75) {
      return 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50';
    }
    return 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/50';
  };

  const getOccupancyRatio = (loc: Location) => {
    const max = loc.capacidadMaxima || 0;
    const current = loc.capacidadActual || 0;
    if (max <= 0) return 'Ilimitado';
    return `${((current / max) * 100).toFixed(0)}%`;
  };

  if (isLoading) {
    return <LoadingState variant="skeleton" skeletonType="card" count={3} text="Cargando distribución del almacén..." />;
  }

  if (isError || locations.length === 0) {
    return (
      <EmptyState
        icon={<Map className="h-10 w-10 text-muted-foreground" />}
        title="Sin distribución / Ubicaciones"
        description="Este almacén no tiene posiciones configuradas en la base de datos para construir el mapa interactivo."
      />
    );
  }

  return (
    <div className={cn('space-y-6 w-full text-left', className)}>
      {/* Indicadores de calor de ocupación */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground dark:text-gray-400 bg-muted/40 p-3 rounded-xl border dark:bg-gray-950 dark:border-gray-800">
        <span className="flex items-center gap-1.5">
          <Info className="h-4 w-4 text-primary" />
          Mapa de Ocupación:
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-green-500 border border-green-600"></span>
          Disponible (&lt;75%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-warning border border-yellow-600"></span>
          Alta (75% - 90%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-destructive border border-red-700"></span>
          Crítica (&gt;90%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-blue-500 border border-blue-600"></span>
          Ilimitada
        </span>
        <span className="flex items-center gap-1.5 opacity-55">
          <span className="h-3 w-3 rounded bg-gray-300 border border-gray-400 dark:bg-gray-700"></span>
          Inactivo
        </span>
      </div>

      {/* Renderizado de Zonas del Almacén */}
      <div className="space-y-8">
        {Object.entries(zonesGroup).map(([zoneName, zoneLocs]) => {
          return (
            <Card key={zoneName} className="dark:bg-gray-900/40 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="bg-muted/50 px-5 py-3 border-b dark:bg-gray-900/40 dark:border-gray-800 flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Grid className="h-4 w-4 text-primary" />
                  Zona: {zoneName}
                </h4>
                <Badge variant="outline" className="dark:border-gray-700">
                  {zoneLocs.length} posiciones
                </Badge>
              </div>
              <CardContent className="p-6">
                <TooltipProvider>
                  {/* Vista cuadriculada scrollable de posiciones */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {zoneLocs.map((loc) => {
                      const isSelected = selectedLocationId === loc.id;
                      const colorClass = getOccupancyColor(loc);

                      return (
                        <Tooltip key={loc.id}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => loc.activo && onLocationSelect && onLocationSelect(loc)}
                              disabled={!loc.activo}
                              className={cn(
                                'flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 select-none cursor-pointer h-20 active:scale-95 shadow-sm',
                                colorClass,
                                isSelected &&
                                  'ring-2 ring-primary border-primary ring-offset-2 scale-105 shadow-md z-10 bg-primary/10 text-primary dark:bg-primary/20 dark:text-white dark:ring-offset-gray-900'
                              )}
                            >
                              <span className="text-xs font-bold font-mono tracking-wide truncate max-w-full">
                                P{loc.pasillo}-E{loc.estanteria}
                              </span>
                              <span className="text-[10px] text-muted-foreground mt-1 block dark:text-gray-400 font-medium">
                                Nivel: {loc.nivel}
                              </span>
                              <span className="text-[9px] font-bold mt-0.5 block uppercase tracking-wider">
                                {getOccupancyRatio(loc)}
                              </span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="p-3 max-w-xs space-y-1 text-left">
                            <div className="font-semibold text-xs flex items-center gap-1">
                              <Layers className="h-3.5 w-3.5 text-primary" />
                              <span>Ubicación: {loc.codigoCompleto}</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground dark:text-gray-400 space-y-0.5 pt-1">
                              <p>Pasillo: <span className="text-foreground font-bold">{loc.pasillo}</span> • Fila/Estante: <span className="text-foreground font-bold">{loc.estanteria}</span></p>
                              <p>Nivel/Altura: <span className="text-foreground font-bold">{loc.nivel}</span></p>
                              <p>Capacidad: <span className="text-foreground font-bold">{(loc.capacidadActual || 0).toLocaleString()}</span> / <span className="text-foreground font-bold">{(loc.capacidadMaxima || '∞').toLocaleString()}</span> Uds</p>
                            </div>
                            {isSelected && (
                              <p className="text-[9px] text-primary font-bold uppercase tracking-wider pt-1.5 animate-pulse">
                                Ubicación seleccionada
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </TooltipProvider>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
