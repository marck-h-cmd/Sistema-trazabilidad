'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api/inventory.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Calendar,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  TrendingDown,
  Warehouse,
  Coins,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface FifoSuggestionsProps {
  /** ID del producto que se requiere despachar */
  productoId: string;
  /** Cantidad total requerida de producto */
  cantidad?: number;
  /** Alias para cantidad */
  cantidadNecesaria?: number;
  /** Callback al confirmar la selección sugerida por el algoritmo FIFO */
  onSelectSuggestions?: (suggestions: { loteId: string; cantidad: number; codigo: string }[]) => void;
  /** Callback opcional al cancelar o cerrar el panel */
  onCancel?: () => void;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente FifoSuggestions
 * Sugiere de forma automatizada los lotes de materia prima o producto terminado
 * que deben ser despachados primero, aplicando estrictamente la regla FIFO (First-In, First-Out)
 * para evitar caducidades en almacén.
 */
export function FifoSuggestions({
  productoId,
  cantidad,
  cantidadNecesaria,
  onSelectSuggestions,
  onCancel,
  className,
}: FifoSuggestionsProps) {
  const finalCantidad = cantidad !== undefined ? cantidad : (cantidadNecesaria !== undefined ? cantidadNecesaria : 0);

  // Cargar sugerencias FIFO desde la API
  const { data: suggestionsResponse, isLoading, isError } = useQuery({
    queryKey: ['fifo-suggestions', productoId, finalCantidad],
    queryFn: () => inventoryApi.getFifoSuggestions(productoId, finalCantidad).then((r) => r.data.data),
    enabled: !!productoId && finalCantidad > 0,
  });

  const suggestions = React.useMemo(() => {
    return (suggestionsResponse as any[]) || [];
  }, [suggestionsResponse]);

  const totalSuggested = React.useMemo(() => {
    return suggestions.reduce((sum, item) => sum + item.cantidadSugerida, 0);
  }, [suggestions]);

  const isStockSufficient = totalSuggested >= finalCantidad;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'No especificada';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy', { locale: es });
    } catch {
      return dateStr;
    }
  };

  const handleConfirm = () => {
    if (onSelectSuggestions && suggestions.length > 0) {
      const formattedSuggestions = suggestions.map((item) => ({
        loteId: item.loteId,
        cantidad: item.cantidadSugerida,
        codigo: item.codigo,
      }));
      onSelectSuggestions(formattedSuggestions);
    }
  };

  if (isLoading) {
    return <LoadingState variant="skeleton" skeletonType="list" count={3} text="Analizando inventario y caducidades (Algoritmo FIFO)..." />;
  }

  if (isError || suggestions.length === 0) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-10 w-10 text-destructive" />}
        title="Stock Insuficiente / Sin Lotes"
        description="No se han encontrado lotes activos y aptos (no bloqueados ni vencidos) de este producto en el almacén para cubrir el pedido."
        action={onCancel ? { label: 'Volver', onClick: onCancel } : undefined}
      />
    );
  }

  return (
    <Card className={cn('border-2 border-primary/20 dark:border-gray-800 dark:bg-gray-900 w-full text-left', className)}>
      <CardHeader className="pb-3 border-b dark:border-gray-800">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2 dark:text-gray-100">
          <TrendingDown className="h-5 w-5 text-primary rotate-90" />
          Sugerencia de Picking FIFO (Salida Optimizada)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* 1. Alerta de Estado del Stock */}
        {isStockSufficient ? (
          <div className="flex items-start gap-3 p-4 border border-green-200 bg-green-50/50 rounded-xl text-green-800 dark:border-green-900/30 dark:bg-green-950/10 dark:text-green-400">
            <CheckCircle className="h-5 w-5 shrink-0 text-success mt-0.5" />
            <div className="text-xs">
              <h5 className="font-bold tracking-tight">Stock Disponible Completo</h5>
              <p className="mt-0.5 text-green-700/90 dark:text-green-400/80 leading-relaxed">
                El sistema ha reservado {suggestions.length} lotes para cubrir las {finalCantidad.toLocaleString()} unidades solicitadas. Todos los lotes siguen la regla FIFO (fecha de caducidad más próxima primero).
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 border border-amber-200 bg-amber-50/50 rounded-xl text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/10 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warning mt-0.5" />
            <div className="text-xs">
              <h5 className="font-bold tracking-tight">Stock Parcial / Insuficiente</h5>
              <p className="mt-0.5 text-amber-700/90 dark:text-amber-400/80 leading-relaxed">
                Solo se pueden cubrir {totalSuggested.toLocaleString()} de las {finalCantidad.toLocaleString()} unidades requeridas. Faltan {(finalCantidad - totalSuggested).toLocaleString()} unidades en inventario apto.
              </p>
            </div>
          </div>
        )}

        {/* 2. Listado de Lotes Sugeridos en FIFO */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider dark:text-gray-400">
            Orden de Retirada Recomendado (FIFO)
          </h4>
          <div className="space-y-2.5">
            {suggestions.map((item, index) => (
              <div
                key={item.loteId}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-muted-foreground/10 bg-white/50 hover:bg-white transition-colors dark:bg-gray-950/50 dark:border-gray-800 dark:hover:bg-gray-950"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    {index + 1}
                  </div>
                  <div>
                    <span className="font-mono font-bold text-sm text-foreground bg-muted px-1.5 py-0.5 rounded border border-muted-foreground/10 dark:bg-gray-800 dark:border-gray-700">
                      {item.codigo}
                    </span>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground mt-1.5 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Caduca: {formatDate(item.fechaCaducidad)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Warehouse className="h-3 w-3" />
                        {item.almacen} • {item.ubicacion}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-none border-muted-foreground/10 text-right">
                  <div className="text-left sm:text-right text-xs">
                    <span className="text-muted-foreground block text-[10px] dark:text-gray-400">Stock total disponible:</span>
                    <span className="font-semibold text-foreground">
                      {item.cantidadDisponible.toLocaleString()} Uds
                    </span>
                  </div>
                  <div className="text-right text-xs bg-primary/5 dark:bg-primary/20 border border-primary/10 px-2.5 py-1 rounded-lg">
                    <span className="text-primary block text-[9px] font-bold uppercase tracking-wider">A retirar:</span>
                    <span className="font-bold text-primary text-sm">
                      {item.cantidadSugerida.toLocaleString()} Uds
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Acciones */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto h-11 dark:border-gray-800"
            >
              Cancelar
            </Button>
          )}
          {onSelectSuggestions && (
            <Button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto h-11 gap-2 shadow-sm font-semibold"
              disabled={suggestions.length === 0}
            >
              Confirmar Selección FIFO
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
