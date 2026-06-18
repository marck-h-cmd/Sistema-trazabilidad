'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { shipmentsApi } from '@/lib/api/shipments.api';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/tables/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  Truck, 
  Plus, 
  Search, 
  RefreshCw,
  Download,
  Filter,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { formatDate, formatDateTime, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';

const columns = [
  {
    key: 'codigo',
    header: 'Código',
    sortable: true,
    cell: (row: any) => (
      <span className="font-mono font-semibold text-primary">{row.codigo}</span>
    ),
  },
  {
    key: 'cliente',
    header: 'Cliente',
    cell: (row: any) => row.cliente?.nombre || 'N/A',
  },
  {
    key: 'items',
    header: 'Items',
    cell: (row: any) => (
      <span className="font-medium">{row.items?.length || 0}</span>
    ),
  },
  {
    key: 'fechaEnvio',
    header: 'Fecha Envío',
    sortable: true,
    cell: (row: any) => (
      <span className={cn(!row.fechaEnvio && 'text-muted-foreground')}>
        {row.fechaEnvio ? formatDate(row.fechaEnvio) : 'Pendiente'}
      </span>
    ),
  },
  {
    key: 'estado',
    header: 'Estado',
    cell: (row: any) => <StatusBadge status={row.estado} />,
  },
];

export default function ExpedicionPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['shipments', page, debouncedSearch, estadoFilter],
    queryFn: () =>
      shipmentsApi.getAll({
        page,
        limit: 10,
        search: debouncedSearch,
        estado: estadoFilter || undefined,
      }),
  });

  const shipments = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  // Estadísticas rápidas
  const enTransito = shipments.filter((s: any) => s.estado === 'EN_TRANSITO').length;
  const entregadas = shipments.filter((s: any) => s.estado === 'ENTREGADO').length;
  const pendientes = shipments.filter((s: any) => s.estado === 'PREPARANDO').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expedición"
        description="Gestione los envíos a clientes y el seguimiento de entregas"
      >
        <Button onClick={() => router.push('/expedicion/nueva')} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Nueva Expedición
        </Button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">{pagination?.total || 0}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Total Expediciones</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">{pendientes}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
              <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">{enTransito}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">En Tránsito</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">{entregadas}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Entregadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-gray-500" />
                <Input
                  placeholder="Buscar por código, cliente..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <Select value={estadoFilter} onValueChange={(v) => { setEstadoFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[160px] dark:border-gray-700">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="PREPARANDO">Preparando</SelectItem>
                  <SelectItem value="EN_TRANSITO">En Tránsito</SelectItem>
                  <SelectItem value="ENTREGADO">Entregado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  <SelectItem value="DEVUELTO">Devuelto</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetch()} className="dark:border-gray-700">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" className="gap-2 dark:border-gray-700">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      {isLoading ? (
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : isError ? (
        <EmptyState
          icon={<Truck className="h-10 w-10" />}
          title="Error al cargar expediciones"
          description="No se pudieron cargar los datos."
          action={{ label: 'Reintentar', onClick: () => refetch() }}
        />
      ) : shipments.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-10 w-10" />}
          title="No hay expediciones"
          description={search ? `Sin resultados para "${search}"` : 'Comience creando una nueva expedición'}
          action={{ label: 'Nueva Expedición', onClick: () => router.push('/expedicion/nueva') }}
        />
      ) : (
        <DataTable
          columns={columns as any}
          data={shipments}
          page={page}
          totalPages={pagination?.totalPages || 1}
          onPageChange={setPage}
          onRowClick={(row: any) => router.push(`/expedicion/${row.id}`)}
        />
      )}
    </div>
  );
}