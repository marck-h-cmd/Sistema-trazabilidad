'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { alertsApi } from '@/lib/api/alerts.api';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/tables/data-table';
import { AlertCard } from '@/components/alerts/alert-card';
import { AlertStatusBadge } from '@/components/alerts/alert-status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  RefreshCw,
  Filter,
  ShieldAlert,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

const columns = [
  {
    key: 'codigo',
    header: 'Código',
    cell: (row: any) => (
      <span className="font-mono font-semibold text-primary">{row.codigo}</span>
    ),
  },
  {
    key: 'titulo',
    header: 'Título',
    cell: (row: any) => (
      <span className="font-medium">{row.titulo}</span>
    ),
  },
  {
    key: 'lote',
    header: 'Lote',
    cell: (row: any) => (
      <span className="font-mono text-sm">{row.lote?.codigo || 'N/A'}</span>
    ),
  },
  {
    key: 'tipo',
    header: 'Tipo',
    cell: (row: any) => <AlertStatusBadge status={row.tipo} />,
  },
  {
    key: 'severidad',
    header: 'Severidad',
    cell: (row: any) => (
      <span className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        row.severidad === 'CRITICO'
          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      )}>
        {row.severidad === 'CRITICO' ? 'Crítico' : 'Aviso'}
      </span>
    ),
  },
  {
    key: 'estado',
    header: 'Estado',
    cell: (row: any) => <AlertStatusBadge status={row.estado} />,
  },
  {
    key: 'fechaCreacion',
    header: 'Fecha',
    cell: (row: any) => formatDate(row.fechaCreacion),
  },
];

export default function AlertasPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [severidadFilter, setSeveridadFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['alerts', page, debouncedSearch, estadoFilter, severidadFilter],
    queryFn: () =>
      alertsApi.getAll({
        page,
        limit: 10,
        search: debouncedSearch,
        estado: estadoFilter || undefined,
        severidad: severidadFilter || undefined,
      }),
  });

  const { data: activeAlerts } = useQuery({
    queryKey: ['active-alerts-count'],
    queryFn: () => alertsApi.getActive(),
    refetchInterval: 60000,
  });

  const alerts = data?.data?.data || [];
  const pagination = data?.data?.pagination;
  const activeCount = activeAlerts?.data?.data?.length || 0;

  const filteredAlerts = activeTab === 'active'
    ? alerts.filter((a: any) => a.estado === 'ABIERTA' || a.estado === 'INVESTIGANDO')
    : activeTab === 'resolved'
    ? alerts.filter((a: any) => a.estado === 'RESUELTA' || a.estado === 'CERRADA')
    : alerts;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas y Crisis"
        description="Gestione las alertas sanitarias y el seguimiento de crisis"
      >
        <Button onClick={() => router.push('/alertas/nueva')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Alerta
        </Button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/30">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">{activeCount}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Alertas Activas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">
                {alerts.filter((a: any) => a.estado === 'INVESTIGANDO').length}
              </p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Investigando</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">
                {alerts.filter((a: any) => a.estado === 'RESUELTA').length}
              </p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Resueltas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
              <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">
                {alerts.filter((a: any) => a.estado === 'CERRADA').length}
              </p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Cerradas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs y filtros */}
      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all" className="gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Todas
                </TabsTrigger>
                <TabsTrigger value="active" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Activas
                </TabsTrigger>
                <TabsTrigger value="resolved" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Resueltas
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, título..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <Select value={estadoFilter} onValueChange={(v) => { setEstadoFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[150px] dark:border-gray-700">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="ABIERTA">Abierta</SelectItem>
                  <SelectItem value="INVESTIGANDO">Investigando</SelectItem>
                  <SelectItem value="RESUELTA">Resuelta</SelectItem>
                  <SelectItem value="CERRADA">Cerrada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severidadFilter} onValueChange={(v) => { setSeveridadFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[150px] dark:border-gray-700">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="CRITICO">Crítico</SelectItem>
                  <SelectItem value="AVISO">Aviso</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetch()} className="dark:border-gray-700">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<AlertTriangle className="h-10 w-10" />}
          title="Error al cargar alertas"
          action={{ label: 'Reintentar', onClick: () => refetch() }}
        />
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert className="h-10 w-10" />}
          title={activeTab === 'active' ? 'No hay alertas activas' : 'No se encontraron alertas'}
          description={activeTab === 'active' ? 'El sistema opera sin alertas activas' : 'No hay alertas que coincidan con los filtros'}
          action={activeTab === 'all' ? { label: 'Nueva Alerta', onClick: () => router.push('/alertas/nueva') } : undefined}
        />
      ) : (
        <>
          <div className="space-y-3">
            {filteredAlerts.map((alert: any) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onClick={() => router.push(`/alertas/${alert.id}`)}
              />
            ))}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="dark:border-gray-700"
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground dark:text-gray-400">
                Página {page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="dark:border-gray-700"
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}