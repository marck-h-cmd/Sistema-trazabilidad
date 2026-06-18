'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { traceabilityApi } from '@/lib/api/traceability.api';
import { PageHeader } from '@/components/shared/page-header';
import { LotCard } from '@/components/lots/lot-card';
import { LotDetail } from '@/components/lots/lot-detail';
import { LotTimeline } from '@/components/lots/lot-timeline';
import { LotStatusBadge } from '@/components/lots/lot-status-badge';
import { LotPrintLabel } from '@/components/lots/lot-print-label';
import { TraceabilityTree } from '@/components/traceability/traceability-tree';
import { BackwardTrace } from '@/components/traceability/backward-trace';
import { ForwardTrace } from '@/components/traceability/forward-trace';
import { TraceabilityMap } from '@/components/traceability/traceability-map';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  GitBranch, 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Clock,
  Download,
  Printer,
  QrCode,
  Share2,
  Package,
  Factory,
  Truck,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';

export default function TraceabilityDetailPage() {
  const params = useParams();
  const codigo = params.codigo as string;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['traceability', codigo],
    queryFn: () => traceabilityApi.getByCode(codigo),
    enabled: !!codigo,
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
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <EmptyState
        icon={<GitBranch className="h-10 w-10" />}
        title="Lote no encontrado"
        description={`No se encontró información para el código: ${codigo}`}
        action={{ label: 'Nueva búsqueda', onClick: () => refetch() }}
      />
    );
  }

  const traceData = data.data;
  const lote = traceData.lote;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trazabilidad de Lote"
        description={`Código: ${lote.codigo}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/trazabilidad">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Nueva búsqueda
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 dark:border-gray-700">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2 dark:border-gray-700">
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
        </div>
      </PageHeader>

      {/* Encabezado del lote */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold tracking-wider text-primary">
                {lote.codigo}
              </span>
              <LotStatusBadge status={lote.estado} size="lg" />
            </div>
            <p className="mt-2 text-lg font-semibold text-foreground dark:text-gray-100">
              {lote.producto?.nombre}
            </p>
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              SKU: {lote.producto?.sku}
            </p>
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground dark:text-gray-500">Cantidad</p>
              <p className="text-xl font-bold dark:text-gray-100">{lote.cantidad}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-500">{lote.unidadMedida}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground dark:text-gray-500">Producción</p>
              <p className="text-lg font-semibold dark:text-gray-200">{lote.fechaProduccion ? formatDate(lote.fechaProduccion) : 'N/A'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground dark:text-gray-500">Caducidad</p>
              <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                {lote.fechaCaducidad ? formatDate(lote.fechaCaducidad) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Ubicación actual */}
        {lote.ubicacionActual && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2.5 dark:bg-gray-800">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm dark:text-gray-300">
              <span className="font-medium">Ubicación actual:</span>{' '}
              {lote.ubicacionActual.almacen} → {lote.ubicacionActual.codigoCompleto}
            </span>
          </div>
        )}
      </div>

      {/* Tabs de trazabilidad */}
      <Tabs defaultValue="tree" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="tree" className="gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Árbol</span>
          </TabsTrigger>
          <TabsTrigger value="backward" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Materias Primas</span>
          </TabsTrigger>
          <TabsTrigger value="forward" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            <span className="hidden sm:inline">Clientes</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Recorrido</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TraceabilityTree
                backwardData={traceData.trazabilidadHaciaAtras}
                forwardData={traceData.trazabilidadHaciaAdelante}
                lote={lote}
              />
            </div>
            <div className="space-y-6">
              <LotTimeline timeline={traceData.lineaTiempo} />
              <LotPrintLabel lot={lote as any} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="backward" className="mt-6">
          <BackwardTrace data={traceData.trazabilidadHaciaAtras} />
        </TabsContent>

        <TabsContent value="forward" className="mt-6">
          <ForwardTrace data={traceData.trazabilidadHaciaAdelante} />
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <TraceabilityMap timeline={traceData.lineaTiempo} />
        </TabsContent>
      </Tabs>
    </div>
  );
}