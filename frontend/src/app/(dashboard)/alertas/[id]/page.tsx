'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { alertsApi } from '@/lib/api/alerts.api';
import { PageHeader } from '@/components/shared/page-header';
import { AlertStatusBadge } from '@/components/alerts/alert-status-badge';
import { AlertTimeline } from '@/components/alerts/alert-timeline';
import { AlertImpactAnalysis } from '@/components/alerts/alert-impact-analysis';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  ArrowLeft, 
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  User,
  Calendar,
  Package,
  Hash,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export default function AlertaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [resolucion, setResolucion] = useState('');
  const [showResolve, setShowResolve] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['alert', id],
    queryFn: () => alertsApi.getById(id),
    enabled: !!id,
  });

  const { data: impactData } = useQuery({
    queryKey: ['alert-impact', id],
    queryFn: () => alertsApi.analyzeImpact(id),
    enabled: !!id && data?.data?.estado !== 'CERRADA',
  });

  const activateMutation = useMutation({
    mutationFn: () => alertsApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert', id] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['active-alerts-count'] });
      toast({ title: 'Alerta activada', description: 'Los lotes afectados han sido bloqueados' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al activar alerta',
        variant: 'destructive',
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: () => alertsApi.resolve(id, { resolucion }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert', id] });
      toast({ title: 'Alerta resuelta', variant: 'success' });
      setShowResolve(false);
      setResolucion('');
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.error?.message, variant: 'destructive' });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => alertsApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert', id] });
      toast({ title: 'Alerta cerrada', variant: 'success' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.error?.message, variant: 'destructive' });
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
        icon={<AlertTriangle className="h-10 w-10" />}
        title="Alerta no encontrada"
        action={{ label: 'Volver', onClick: () => router.push('/alertas') }}
      />
    );
  }

  const alert = data.data.data;
  const impact = impactData?.data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Alerta ${alert.codigo}`}
        description={alert.titulo}
      >
        <div className="flex flex-wrap items-center gap-2">
          {alert.estado === 'ABIERTA' && (
            <Button
              onClick={() => activateMutation.mutate()}
              disabled={activateMutation.isPending}
              className="gap-2"
            >
              {activateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              Activar Alerta
            </Button>
          )}
          {alert.estado === 'INVESTIGANDO' && (
            <Button
              onClick={() => setShowResolve(true)}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Resolver
            </Button>
          )}
          {alert.estado === 'RESUELTA' && (
            <Button
              onClick={() => closeMutation.mutate()}
              disabled={closeMutation.isPending}
              variant="outline"
              className="gap-2 dark:border-gray-700"
            >
              <XCircle className="h-4 w-4" />
              Cerrar Alerta
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/alertas">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Info principal */}
          <Card className={cn(
            'dark:border-gray-800 dark:bg-gray-900',
            alert.severidad === 'CRITICO' && 'border-l-4 border-l-red-500 dark:border-l-red-600'
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                  <AlertTriangle className={cn(
                    'h-5 w-5',
                    alert.severidad === 'CRITICO' ? 'text-red-500' : 'text-amber-500'
                  )} />
                  {alert.titulo}
                </CardTitle>
                <AlertStatusBadge status={alert.estado} size="md" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Código:</span>
                    <span className="font-mono font-semibold dark:text-gray-200">{alert.codigo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Lote:</span>
                    <Link href={`/trazabilidad/${alert.lote?.codigo}`} className="font-mono font-semibold text-primary hover:underline">
                      {alert.lote?.codigo || 'N/A'}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Creada por:</span>
                    <span className="dark:text-gray-300">
                      {alert.creador?.nombre} {alert.creador?.apellido}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Creación:</span>
                    <span className="dark:text-gray-300">{formatDateTime(alert.fechaCreacion)}</span>
                  </div>
                  {alert.fechaResolucion && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground dark:text-gray-400">Resolución:</span>
                      <span className="dark:text-gray-300">{formatDateTime(alert.fechaResolucion)}</span>
                    </div>
                  )}
                  {alert.fechaCierre && (
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-muted-foreground dark:text-gray-400">Cierre:</span>
                      <span className="dark:text-gray-300">{formatDateTime(alert.fechaCierre)}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="dark:bg-gray-700" />

              <div>
                <p className="text-sm font-medium dark:text-gray-300">Descripción</p>
                <p className="mt-1 text-sm text-muted-foreground dark:text-gray-400">{alert.descripcion}</p>
              </div>

              {alert.resolucion && (
                <div>
                  <p className="text-sm font-medium dark:text-gray-300">Resolución</p>
                  <p className="mt-1 text-sm text-muted-foreground dark:text-gray-400">{alert.resolucion}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Análisis de impacto */}
          {impact && (
            <AlertImpactAnalysis alertId={id} data={impact} />
          )}
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
                <span className="text-sm text-muted-foreground dark:text-gray-400">Tipo</span>
                <AlertStatusBadge status={alert.tipo} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-gray-400">Severidad</span>
                <Badge variant={alert.severidad === 'CRITICO' ? 'destructive' : 'warning'}>
                  {alert.severidad === 'CRITICO' ? 'Crítico' : 'Aviso'}
                </Badge>
              </div>
              {impact && (
                <>
                  <Separator className="dark:bg-gray-700" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Lotes afectados</span>
                    <span className="font-semibold dark:text-gray-200">{impact.resumen?.totalLotesAfectados || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Clientes afectados</span>
                    <span className="font-semibold dark:text-gray-200">{impact.resumen?.totalClientesAfectados || 0}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Línea de tiempo */}
          <AlertTimeline alert={alert} />
        </div>
      </div>

      {/* Modal resolver */}
      <Dialog open={showResolve} onOpenChange={setShowResolve}>
        <DialogContent className="dark:border-gray-800 dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Resolver Alerta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Resolución</Label>
              <Textarea
                placeholder="Describa cómo se resolvió la alerta..."
                value={resolucion}
                onChange={(e) => setResolucion(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolve(false)} className="dark:border-gray-700">
              Cancelar
            </Button>
            <Button
              onClick={() => resolveMutation.mutate()}
              disabled={resolveMutation.isPending || !resolucion.trim()}
            >
              {resolveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Confirmar Resolución
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}