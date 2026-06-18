'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { receptionsApi } from '@/lib/api/receptions.api';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { LotCard } from '@/components/lots/lot-card';
import { 
  Package, 
  ArrowLeft, 
  Truck, 
  User, 
  Calendar, 
  Hash,
  FileText,
  Download,
  Printer,
  Camera,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatDateTime } from '@/lib/formatters';

export default function RecepcionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reception', id],
    queryFn: () => receptionsApi.getById(id),
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
        icon={<Package className="h-10 w-10" />}
        title="Recepción no encontrada"
        description="No se encontró la recepción solicitada"
        action={{ label: 'Volver', onClick: () => router.push('/recepcion') }}
      />
    );
  }

  const reception = data.data.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Recepción ${reception.codigo}`}
        description={`Registrada el ${formatDateTime(reception.fechaRecepcion)}`}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 dark:border-gray-700">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" className="gap-2 dark:border-gray-700">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/recepcion">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos generales */}
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                <Package className="h-5 w-5 text-primary" />
                Datos de la Recepción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Código:</span>
                    <span className="font-mono font-semibold dark:text-gray-200">{reception.codigo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Proveedor:</span>
                    <span className="font-medium dark:text-gray-200">{reception.proveedor?.nombre || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Fecha:</span>
                    <span className="dark:text-gray-300">{formatDateTime(reception.fechaRecepcion)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Recibido por:</span>
                    <span className="dark:text-gray-300">
                      {reception.receptor?.nombre} {reception.receptor?.apellido}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={reception.estado} />
                  </div>
                  <div className="flex items-center gap-2">
                    {reception.metodoEntrada === 'ESCANEO_CODIGO_BARRAS' ? (
                      <Camera className="h-4 w-4 text-green-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="text-sm text-muted-foreground dark:text-gray-400">
                      {reception.metodoEntrada === 'ESCANEO_CODIGO_BARRAS' ? 'Escaneo' : 'Manual'}
                    </span>
                  </div>
                </div>
              </div>

              {reception.numeroAlbaran && (
                <div className="mt-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                  <span className="text-sm text-muted-foreground dark:text-gray-400">Albarán:</span>
                  <span className="dark:text-gray-300">{reception.numeroAlbaran}</span>
                </div>
              )}
              {reception.numeroFactura && (
                <div className="mt-1 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                  <span className="text-sm text-muted-foreground dark:text-gray-400">Factura:</span>
                  <span className="dark:text-gray-300">{reception.numeroFactura}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lotes recibidos */}
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                <Package className="h-5 w-5 text-primary" />
                Lotes Recibidos ({reception.lotes?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reception.lotes && reception.lotes.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {reception.lotes.map((lote: any) => (
                    <LotCard key={lote.id} lot={lote} />
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground dark:text-gray-500">
                  No hay lotes asociados a esta recepción
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resumen */}
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base dark:text-gray-100">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-gray-400">Total lotes</span>
                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                  {reception.lotes?.length || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-gray-400">Cantidad total</span>
                <span className="font-semibold dark:text-gray-200">
                  {reception.lotes?.reduce((sum: number, l: any) => sum + l.cantidad, 0) || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Documentos */}
          {reception.documentos && reception.documentos.length > 0 && (
            <Card className="dark:border-gray-800 dark:bg-gray-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base dark:text-gray-100">Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reception.documentos.map((doc: any) => (
                    <Button
                      key={doc.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 dark:border-gray-700"
                      asChild
                    >
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{doc.nombre}</span>
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observaciones */}
          {reception.observaciones && (
            <Card className="dark:border-gray-800 dark:bg-gray-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base dark:text-gray-100">Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  {reception.observaciones}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}