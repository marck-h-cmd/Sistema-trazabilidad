'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { productionsApi } from '@/lib/api/productions.api';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { LotDetail } from '@/components/lots/lot-detail';
import { LotPrintLabel } from '@/components/lots/lot-print-label';
import { 
  Factory, 
  ArrowLeft, 
  Package,
  Beaker,
  Thermometer,
  Clock,
  Droplets,
  TrendingUp,
  User,
  Calendar,
  QrCode,
  Printer,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatDateTime, formatNumber } from '@/lib/formatters';

export default function ProduccionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['production', id],
    queryFn: () => productionsApi.getById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[400px]" />
          </div>
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <EmptyState
        icon={<Factory className="h-10 w-10" />}
        title="Producción no encontrada"
        description="No se encontró la producción solicitada"
        action={{ label: 'Volver', onClick: () => router.push('/produccion') }}
      />
    );
  }

  const production = data.data.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detalle de Producción"
        description={`Lote: ${production.lote?.codigo || 'N/A'}`}
      >
        <div className="flex items-center gap-2">
          {production.lote && (
            <Button variant="outline" size="sm" className="gap-2 dark:border-gray-700" asChild>
              <Link href={`/trazabilidad/${production.lote.codigo}`}>
                <QrCode className="h-4 w-4" />
                Trazabilidad
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/produccion">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos de producción */}
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                <Factory className="h-5 w-5 text-primary" />
                Datos de Producción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Factory className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Línea:</span>
                    <span className="font-mono font-semibold dark:text-gray-200">
                      {production.lineaProduccion?.codigo} - {production.lineaProduccion?.nombre}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Operario:</span>
                    <span className="dark:text-gray-300">
                      {production.operario?.nombre} {production.operario?.apellido}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Inicio:</span>
                    <span className="dark:text-gray-300">{formatDateTime(production.fechaInicio)}</span>
                  </div>
                  {production.fechaFin && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                      <span className="text-sm text-muted-foreground dark:text-gray-400">Fin:</span>
                      <span className="dark:text-gray-300">{formatDateTime(production.fechaFin)}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {production.tamanoLote && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                      <span className="text-sm text-muted-foreground dark:text-gray-400">Tamaño lote:</span>
                      <span className="dark:text-gray-300">{formatNumber(production.tamanoLote)}</span>
                    </div>
                  )}
                  {production.rendimiento && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground dark:text-gray-400">Rendimiento:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {production.rendimiento.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Parámetros */}
              {(production.temperaturaHorno || production.tiempoCoccion || production.humedad) && (
                <>
                  <Separator className="my-4 dark:bg-gray-700" />
                  <div className="grid gap-2 sm:grid-cols-3">
                    {production.temperaturaHorno && (
                      <div className="rounded-lg bg-muted/50 p-3 dark:bg-gray-800">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-muted-foreground dark:text-gray-400">Temperatura</span>
                        </div>
                        <p className="mt-1 text-lg font-bold dark:text-gray-200">{production.temperaturaHorno}°C</p>
                      </div>
                    )}
                    {production.tiempoCoccion && (
                      <div className="rounded-lg bg-muted/50 p-3 dark:bg-gray-800">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-xs text-muted-foreground dark:text-gray-400">Tiempo</span>
                        </div>
                        <p className="mt-1 text-lg font-bold dark:text-gray-200">{production.tiempoCoccion} min</p>
                      </div>
                    )}
                    {production.humedad && (
                      <div className="rounded-lg bg-muted/50 p-3 dark:bg-gray-800">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-cyan-500" />
                          <span className="text-xs text-muted-foreground dark:text-gray-400">Humedad</span>
                        </div>
                        <p className="mt-1 text-lg font-bold dark:text-gray-200">{production.humedad}%</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Materias primas */}
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                <Beaker className="h-5 w-5 text-primary" />
                Materias Primas Utilizadas ({production.materiasPrimas?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {production.materiasPrimas && production.materiasPrimas.length > 0 ? (
                <div className="space-y-2">
                  {production.materiasPrimas.map((mp: any) => (
                    <div
                      key={mp.id}
                      className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30">
                          <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-semibold dark:text-gray-200">
                            {mp.lote?.codigo || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground dark:text-gray-400">
                            {mp.lote?.producto?.nombre || 'Materia Prima'} • {mp.proveedor?.nombre || 'Proveedor'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                        {formatNumber(mp.cantidad)} {mp.unidadMedida}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground dark:text-gray-500">
                  No hay materias primas registradas
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lote generado */}
          {production.lote && (
            <>
              <Card className="dark:border-gray-800 dark:bg-gray-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base dark:text-gray-100">Lote Generado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="font-mono text-2xl font-bold text-primary">{production.lote.codigo}</p>
                    <p className="mt-1 text-sm dark:text-gray-300">{production.lote.producto?.nombre}</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-500">
                      {formatNumber(production.lote.cantidad || 0)} {production.lote.unidadMedida}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2 dark:border-gray-700" asChild>
                      <Link href={`/trazabilidad/${production.lote.codigo}`}>
                        <QrCode className="h-4 w-4" />
                        Trazabilidad
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Impresión de etiquetas */}
              <LotPrintLabel lot={production.lote as any} />
            </>
          )}

          {/* Etiquetas */}
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base dark:text-gray-100">Etiquetas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-gray-400">Tipo</span>
                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                  {production.tipoEtiqueta === 'CODE_128' ? 'Code 128' :
                   production.tipoEtiqueta === 'QR' ? 'QR' : 'Ambos'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-gray-400">Cantidad</span>
                <span className="font-semibold dark:text-gray-200">{production.cantidadEtiquetas || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-gray-400">Estado</span>
                {production.etiquetasImpresas ? (
                  <Badge variant="success" className="text-xs">Impresas</Badge>
                ) : (
                  <Badge variant="warning" className="text-xs">Pendientes</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          {production.observaciones && (
            <Card className="dark:border-gray-800 dark:bg-gray-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base dark:text-gray-100">Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground dark:text-gray-400">{production.observaciones}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}