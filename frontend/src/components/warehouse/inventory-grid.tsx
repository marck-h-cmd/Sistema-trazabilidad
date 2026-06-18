'use client';

import * as React from 'react';
import { useLots } from '@/hooks/use-lot';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Layers, MapPin, Package, Search, Sparkles } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface InventoryGridProps {
  /** ID de almacén opcional para filtrar los lotes de stock */
  almacenId?: string | null;
  /** Callback opcional al hacer clic en un lote */
  onItemClick?: (lot: any) => void;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente InventoryGrid
 * Rejilla de tarjetas de inventario interactiva, con búsqueda en tiempo real,
 * detección de caducidad cromática y visualización del estado del lote.
 */
export function InventoryGrid({
  almacenId,
  onItemClick,
  className,
}: InventoryGridProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Cargar lotes con filtro de almacén si corresponde
  const params = React.useMemo(() => {
    const p: Record<string, any> = { limit: 100 };
    if (almacenId) {
      p.almacenId = almacenId;
    }
    if (searchQuery) {
      p.search = searchQuery;
    }
    return p;
  }, [almacenId, searchQuery]);

  const { lots, isLoading, refetch } = useLots(params);

  // Debounce simple para la búsqueda
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getDaysToExpiration = (dateStr?: string | null) => {
    if (!dateStr) return null;
    return differenceInDays(new Date(dateStr), new Date());
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'No especificada';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy', { locale: es });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={cn('space-y-6 w-full text-left', className)}>
      {/* Barra de búsqueda superior */}
      <div className="relative flex items-center max-w-md">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Buscar lote, SKU, producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-10 rounded-xl border-muted-foreground/20 focus-visible:ring-2 focus-visible:ring-primary dark:bg-gray-950 dark:border-gray-800"
        />
      </div>

      {isLoading ? (
        <LoadingState variant="skeleton" skeletonType="card" count={6} text="Cargando stock de inventario..." />
      ) : lots.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lots.map((lot: any) => {
            const daysToExpiry = getDaysToExpiration(lot.fechaCaducidad);
            const isExpired = daysToExpiry !== null && daysToExpiry < 0;
            const isExpiringSoon = daysToExpiry !== null && daysToExpiry >= 0 && daysToExpiry <= 7;

            return (
              <Card
                key={lot.id}
                onClick={() => onItemClick && onItemClick(lot)}
                className={cn(
                  'group overflow-hidden border transition-all duration-300 hover:shadow-md cursor-pointer active:scale-[0.99] dark:bg-gray-900/40 dark:border-gray-800',
                  onItemClick && 'hover:border-primary/40',
                  isExpired && 'border-l-4 border-l-destructive border-destructive/20 bg-red-500/5',
                  isExpiringSoon && 'border-l-4 border-l-warning border-warning/20 bg-warning/5'
                )}
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  {/* Fila 1: Producto y Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground dark:text-gray-400">
                        {lot.producto?.sku || 'SIN SKU'}
                      </span>
                      <h4 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {lot.producto?.nombre || 'Producto Desconocido'}
                      </h4>
                    </div>
                    <StatusBadge status={lot.estado} type="lot" showDot className="shrink-0" />
                  </div>

                  {/* Fila 2: Código de Lote e Indicador */}
                  <div className="space-y-1 bg-muted/30 p-2.5 rounded-lg border dark:bg-gray-800/30 dark:border-gray-800">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground dark:text-gray-400">Código Lote:</span>
                      <span className="font-mono font-bold text-foreground bg-white dark:bg-gray-950 px-1.5 py-0.5 rounded border border-muted-foreground/10">
                        {lot.codigo}
                      </span>
                    </div>
                  </div>

                  {/* Fila 3: Cantidad y Ubicación */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground dark:text-gray-400">
                      <Layers className="h-3.5 w-3.5 text-primary" />
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-muted-foreground/80">Cantidad</span>
                        <span className="font-bold text-foreground">
                          {lot.cantidad.toLocaleString()} {lot.unidadMedida}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground dark:text-gray-400">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-muted-foreground/80">Ubicación</span>
                        <span className="font-semibold text-foreground truncate max-w-[90px] block">
                          {lot.ubicacion?.codigoCompleto || 'Sin Ubicar'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fila 4: Caducidad */}
                  {lot.fechaCaducidad && (
                    <div
                      className={cn(
                        'flex items-center gap-1.5 text-xs p-2 rounded-lg border border-transparent',
                        isExpired && 'bg-destructive/10 text-destructive dark:bg-red-950/20 dark:text-red-400',
                        isExpiringSoon && 'bg-warning/10 text-warning dark:bg-amber-950/20 dark:text-amber-400',
                        !isExpired && !isExpiringSoon && 'bg-muted/40 text-muted-foreground dark:bg-gray-800/40 dark:text-gray-400'
                      )}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <div className="text-[10px]">
                        <span className="block font-medium">Caducidad: {formatDate(lot.fechaCaducidad)}</span>
                        {isExpired && <span className="font-bold uppercase text-[9px]">Lote Vencido</span>}
                        {isExpiringSoon && (
                          <span className="font-bold uppercase text-[9px]">Caduca en {daysToExpiry} días</span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Package className="h-10 w-10 text-muted-foreground" />}
          title="Sin stock en inventario"
          description={
            searchTerm
              ? 'No hay lotes de stock que coincidan con la búsqueda actual.'
              : 'Este almacén no contiene mercancía registrada actualmente.'
          }
          action={
            searchTerm
              ? {
                  label: 'Limpiar búsqueda',
                  onClick: () => setSearchTerm(''),
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
