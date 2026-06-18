'use client';

import * as React from 'react';
import { AlertImpactAnalysis as ImpactAnalysisType } from '@/types/alert.types';
import { LoadingState } from '@/components/shared/loading-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  Users,
  Package,
  ShieldAlert,
  CheckCircle,
  TrendingDown,
  Warehouse,
  Truck,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AlertImpactAnalysisProps {
  /** ID de la alerta para la cual se muestra el análisis */
  alertId: string;
  /** Datos del análisis de impacto de la alerta */
  impactData?: ImpactAnalysisType;
  /** Alias para impactData */
  data?: ImpactAnalysisType;
  /** Indica si se están cargando los datos de impacto */
  isLoading?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente AlertImpactAnalysis
 * Cuadro de mando interactivo y detallado para evaluar la propagación de una alerta de calidad,
 * identificando el stock remanente en almacén y los clientes finales comprometidos.
 */
export function AlertImpactAnalysis({
  alertId,
  impactData,
  data,
  isLoading = false,
  className,
}: AlertImpactAnalysisProps) {
  const finalImpactData = impactData || data;
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Fecha no disponible';
    try {
      return format(new Date(dateStr), "dd MMM, yyyy", { locale: es });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return <LoadingState variant="skeleton" skeletonType="table" count={5} text="Analizando árbol de trazabilidad e impacto..." />;
  }

  if (!finalImpactData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-2xl dark:border-gray-800">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">
          No hay datos de análisis de impacto disponibles para esta alerta.
        </p>
      </div>
    );
  }

  const { resumen, lotesAfectados = [], clientesAfectados = [] } = finalImpactData;

  const isFullyContained = clientesAfectados.length === 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* 1. Alerta de Contención */}
      {isFullyContained ? (
        <div className="flex items-center gap-3 p-4 border border-green-200 bg-green-50/50 rounded-2xl text-green-800 dark:border-green-900/30 dark:bg-green-950/10 dark:text-green-400 animate-fade-in">
          <CheckCircle className="h-5 w-5 shrink-0 text-success" />
          <div className="text-sm">
            <h5 className="font-bold tracking-tight">Incidente Totalmente Contenido</h5>
            <p className="text-xs mt-0.5 text-green-700/90 dark:text-green-400/80 leading-relaxed">
              Excelente: el 100% de la mercancía afectada se encuentra inmovilizada en nuestros almacenes. No se ha realizado ninguna expedición a clientes externos.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 border border-red-200 bg-red-50/50 rounded-2xl text-red-800 dark:border-red-900/30 dark:bg-red-950/10 dark:text-red-400 animate-fade-in">
          <ShieldAlert className="h-5 w-5 shrink-0 text-destructive animate-pulse" />
          <div className="text-sm">
            <h5 className="font-bold tracking-tight">Incidente con Fuga al Mercado</h5>
            <p className="text-xs mt-0.5 text-red-700/90 dark:text-red-400/80 leading-relaxed">
              Atención: Se han detectado {resumen.totalClientesAfectados} clientes que recibieron parte del lote comprometido. Active el protocolo de comunicación y retirada.
            </p>
          </div>
        </div>
      )}

      {/* 2. Tarjetas de Resumen Numérico */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="dark:bg-gray-900/40 dark:border-gray-800">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider dark:text-gray-400">
              Lotes Afectados
            </span>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumen.totalLotesAfectados}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
              Lote raíz + lotes derivados
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900/40 dark:border-gray-800">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider dark:text-gray-400">
              Clientes Afectados
            </span>
            <Users className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumen.totalClientesAfectados}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
              Clientes que recibieron expediciones
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900/40 dark:border-gray-800">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider dark:text-gray-400">
              Stock en Almacén
            </span>
            <Warehouse className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resumen.cantidadPendienteAlmacen.toLocaleString()} Kg/Uds
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
              Mercancía bloqueable inmediatamente
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900/40 dark:border-gray-800">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider dark:text-gray-400">
              Stock Distribuido
            </span>
            <Truck className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resumen.cantidadTotalDistribuida.toLocaleString()} Kg/Uds
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
              Mercancía enviada fuera de planta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Tasa de Contención y Recuperación */}
      <Card className="dark:bg-gray-900/40 dark:border-gray-800">
        <CardContent className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <span className="text-sm font-bold tracking-tight text-foreground">
                Tasa de Contención de Stock
              </span>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                Porcentaje de mercancía afectada que logramos retener/recuperar
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-lg font-bold text-success">
              <TrendingDown className="h-5 w-5 shrink-0 rotate-180" />
              <span>{resumen.porcentajeRecuperable.toFixed(1)}%</span>
            </div>
          </div>
          <Progress value={resumen.porcentajeRecuperable} className="h-3" />
        </CardContent>
      </Card>

      {/* 4. Tablas de Detalle */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Lotes Afectados en Almacén */}
        <Card className="dark:bg-gray-900/40 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2 dark:text-gray-100">
              <Warehouse className="h-4 w-4 text-primary" />
              Stock Disponible en Planta
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {lotesAfectados.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código Lote</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead>Ubicación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotesAfectados.map((lote) => (
                    <TableRow key={lote.id}>
                      <TableCell className="font-mono font-bold text-xs tracking-wider">
                        {lote.codigo}
                      </TableCell>
                      <TableCell className="text-xs truncate max-w-[150px]">
                        {lote.producto}
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs">
                        {lote.cantidad}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] border dark:bg-gray-800 dark:border-gray-700">
                          {lote.ubicacion || 'Sin Ubicación'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground dark:text-gray-400">
                No hay stock retenido de este lote en ningún almacén.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clientes Afectados */}
        <Card className="dark:bg-gray-900/40 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2 dark:text-gray-100">
              <Truck className="h-4 w-4 text-destructive" />
              Clientes Comprometidos (Envíos)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {clientesAfectados.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código / Cliente</TableHead>
                    <TableHead className="text-right">Cantidad Enviada</TableHead>
                    <TableHead>Fecha Envío</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesAfectados.map((cli) => (
                    <TableRow key={cli.id}>
                      <TableCell className="text-xs">
                        <span className="block font-semibold text-foreground">{cli.nombre}</span>
                        <span className="text-[10px] text-muted-foreground block font-mono dark:text-gray-400">
                          {cli.codigo}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-destructive text-xs dark:text-red-400">
                        {cli.cantidadRecibida}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDate(cli.fechaEnvio)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-xs text-success font-semibold bg-green-500/5 dark:bg-green-950/5">
                ¡Seguridad garantizada! Ningún cliente ha recibido esta mercancía.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
