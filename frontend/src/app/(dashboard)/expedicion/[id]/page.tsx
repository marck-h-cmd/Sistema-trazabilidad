'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { shipmentsApi } from '@/lib/api/shipments.api';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import { LotCard } from '@/components/lots/lot-card';
import { 
  Truck, 
  ArrowLeft, 
  Store, 
  User, 
  Calendar, 
  Hash,
  FileText,
  Download,
  Printer,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatDateTime, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';

const ESTADO_ACTIONS: Record<string, { label: string; estado: string; variant: 'default' | 'outline' | 'destructive'; icon: any }> = {
  PREPARANDO: { label: 'Enviar', estado: 'EN_TRANSITO', variant: 'default', icon: Truck },
  EN_TRANSITO: { label: 'Entregar', estado: 'ENTREGADO', variant: 'default', icon: CheckCircle2 },
};

export default function ExpedicionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['shipment', id],
    queryFn: () => shipmentsApi.getById(id),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (estado: string) => shipmentsApi.updateStatus(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment', id] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      toast({ title: 'Estado actualizado', variant: 'success' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al actualizar estado',
        variant: 'destructive',
      });
    },
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
        icon={<Truck className="h-10 w-10" />}
        title="Expedición no encontrada"
        description="No se encontró la expedición solicitada"
        action={{ label: 'Volver', onClick: () => router.push('/expedicion') }}
      />
    );
  }

  const shipment = data.data.data;
  const currentAction = ESTADO_ACTIONS[shipment.estado];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Expedición ${shipment.codigo}`}
        description={`Creada el ${formatDateTime(shipment.creadoEn)}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {currentAction && (
            <Button
              onClick={() => updateStatusMutation.mutate(currentAction.estado)}
              disabled={updateStatusMutation.isPending}
              className="gap-2"
            >
              <currentAction.icon className="h-4 w-4" />
              {updateStatusMutation.isPending ? 'Actualizando...' : currentAction.label}
            </Button>
          )}
          {shipment.estado === 'PREPARANDO' && (
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={() => updateStatusMutation.mutate('CANCELADO')}
              disabled={updateStatusMutation.isPending}
            >
              <XCircle className="h-4 w-4" />
              Cancelar
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2 dark:border-gray-700">
            <Printer className="h-4 w-4" />
            Imprimir Albarán
          </Button>
          <Button variant="outline" size="sm" className="gap-2 dark:border-gray-700">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/expedicion">
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                  <Truck className="h-5 w-5 text-primary" />
                  Datos de la Expedición
                </CardTitle>
                <StatusBadge status={shipment.estado} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Cliente:</span>
                    <span className="font-medium dark:text-gray-200">{shipment.cliente?.nombre || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Código:</span>
                    <span className="font-mono font-semibold dark:text-gray-200">{shipment.codigo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Preparado por:</span>
                    <span className="dark:text-gray-300">
                      {shipment.preparador?.nombre} {shipment.preparador?.apellido}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {shipment.fechaEnvio && (
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                      <span className="text-sm text-muted-foreground dark:text-gray-400">Enviado:</span>
                      <span className="dark:text-gray-300">{formatDateTime(shipment.fechaEnvio)}</span>
                    </div>
                  )}
                  {shipment.fechaEntrega && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground dark:text-gray-400">Entregado:</span>
                      <span className="dark:text-gray-300">{formatDateTime(shipment.fechaEntrega)}</span>
                    </div>
                  )}
                  {shipment.fechaPrevistaEntrega && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                      <span className="text-sm text-muted-foreground dark:text-gray-400">Prevista:</span>
                      <span className="dark:text-gray-300">{formatDate(shipment.fechaPrevistaEntrega)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transporte */}
              {(shipment.empresaTransporte || shipment.matriculaVehiculo) && (
                <>
                  <Separator className="my-4 dark:bg-gray-700" />
                  <div className="grid gap-2 sm:grid-cols-3">
                    {shipment.empresaTransporte && (
                      <div>
                        <p className="text-xs text-muted-foreground dark:text-gray-500">Transportista</p>
                        <p className="text-sm dark:text-gray-300">{shipment.empresaTransporte}</p>
                      </div>
                    )}
                    {shipment.matriculaVehiculo && (
                      <div>
                        <p className="text-xs text-muted-foreground dark:text-gray-500">Matrícula</p>
                        <p className="text-sm font-mono dark:text-gray-300">{shipment.matriculaVehiculo}</p>
                      </div>
                    )}
                    {shipment.nombreConductor && (
                      <div>
                        <p className="text-xs text-muted-foreground dark:text-gray-500">Conductor</p>
                        <p className="text-sm dark:text-gray-300">{shipment.nombreConductor}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Items / Lotes */}
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                <Package className="h-5 w-5 text-primary" />
                Lotes Enviados ({shipment.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shipment.items && shipment.items.length > 0 ? (
                <div className="space-y-3">
                  {shipment.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700 hover:bg-muted/50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => router.push(`/trazabilidad/${item.lote?.codigo}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg',
                          item.verificado
                            ? 'bg-green-50 dark:bg-green-900/30'
                            : 'bg-amber-50 dark:bg-amber-900/30'
                        )}>
                          {item.verificado ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-mono text-sm font-semibold dark:text-gray-200">
                            {item.lote?.codigo || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground dark:text-gray-400">
                            {item.lote?.producto?.nombre || 'Producto'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold dark:text-gray-200">
                          {formatNumber(item.cantidad)} {item.unidadMedida}
                        </p>
                        {item.precioTotal && (
                          <p className="text-xs text-muted-foreground dark:text-gray-500">
                            €{formatNumber(item.precioTotal)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground dark:text-gray-500">
                  No hay lotes asociados a esta expedición
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
                <span className="text-sm text-muted-foreground dark:text-gray-400">Total items</span>
                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                  {shipment.items?.length || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-gray-400">Cantidad total</span>
                <span className="font-semibold dark:text-gray-200">
                  {formatNumber(
                    shipment.items?.reduce((sum: number, item: any) => sum + item.cantidad, 0) || 0
                  )}
                </span>
              </div>
              {shipment.items?.some((i: any) => i.precioTotal) && (
                <div className="flex items-center justify-between border-t pt-3 dark:border-gray-700">
                  <span className="text-sm font-medium dark:text-gray-300">Total facturado</span>
                  <span className="font-bold text-primary">
                    €{formatNumber(
                      shipment.items?.reduce((sum: number, item: any) => sum + (item.precioTotal || 0), 0) || 0
                    )}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cliente */}
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base dark:text-gray-100">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium dark:text-gray-200">{shipment.cliente?.nombre || 'N/A'}</p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">{shipment.cliente?.direccion}</p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                {shipment.cliente?.ciudad}, {shipment.cliente?.pais}
              </p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">{shipment.cliente?.emailContacto}</p>
            </CardContent>
          </Card>

          {/* Observaciones */}
          {shipment.observaciones && (
            <Card className="dark:border-gray-800 dark:bg-gray-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base dark:text-gray-100">Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground dark:text-gray-400">{shipment.observaciones}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}