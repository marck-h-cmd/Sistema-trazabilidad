'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { receptionsApi } from '@/lib/api/receptions.api';
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
  Package, 
  Plus, 
  Search, 
  RefreshCw,
  Download,
  Filter,
  Scan,
  Camera,
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { useScannerStore } from '@/stores/scanner.store';
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
    key: 'proveedor',
    header: 'Proveedor',
    cell: (row: any) => row.proveedor?.nombre || 'N/A',
  },
  {
    key: 'fechaRecepcion',
    header: 'Fecha',
    sortable: true,
    cell: (row: any) => formatDateTime(row.fechaRecepcion),
  },
  {
    key: 'metodoEntrada',
    header: 'Método',
    cell: (row: any) => (
      <div className="flex items-center gap-1.5">
        {row.metodoEntrada === 'ESCANEO_CODIGO_BARRAS' ? (
          <Camera className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Search className="h-3.5 w-3.5 text-blue-500" />
        )}
        <span className="text-xs text-muted-foreground">
          {row.metodoEntrada === 'ESCANEO_CODIGO_BARRAS' ? 'Escaneo' : 'Manual'}
        </span>
      </div>
    ),
  },
  {
    key: 'estado',
    header: 'Estado',
    cell: (row: any) => <StatusBadge status={row.estado} />,
  },
];

export default function RecepcionPage() {
  const router = useRouter();
  const { mode } = useScannerStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['receptions', page, debouncedSearch, estadoFilter],
    queryFn: () =>
      receptionsApi.getAll({
        page,
        limit: 10,
        search: debouncedSearch,
        estado: estadoFilter || undefined,
      }),
  });

  const receptions = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  // Stats rápidas
  const { data: recentData } = useQuery({
    queryKey: ['receptions-stats'],
    queryFn: () => receptionsApi.getRecent(100),
  });

  const todayReceptions = recentData?.data?.data?.filter(
    (r: any) => new Date(r.fechaRecepcion).toDateString() === new Date().toDateString()
  ).length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recepción de Materia Prima"
        description="Gestione las entradas de materia prima al almacén"
      >
        <Button onClick={() => router.push('/recepcion/nueva')} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Nueva Recepción
        </Button>
      </PageHeader>

      {/* KPIs rápidos */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/30">
              <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">{todayReceptions}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Recepciones Hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
              <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">{pagination?.total || 0}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Total Recepciones</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/30">
              <Scan className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">
                {mode === 'scan' ? 'Escaneo' : 'Manual'}
              </p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Modo Actual</p>
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
                  placeholder="Buscar por código, proveedor..."
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
                  <SelectItem value="COMPLETADA">Completada</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="VERIFICADA">Verificada</SelectItem>
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
          icon={<Package className="h-10 w-10" />}
          title="Error al cargar recepciones"
          description="No se pudieron cargar los datos. Intente nuevamente."
          action={{ label: 'Reintentar', onClick: () => refetch() }}
        />
      ) : receptions.length === 0 ? (
        <EmptyState
          icon={<Package className="h-10 w-10" />}
          title="No hay recepciones"
          description={search ? `Sin resultados para "${search}"` : 'Comience registrando su primera recepción'}
          action={{ label: 'Nueva Recepción', onClick: () => router.push('/recepcion/nueva') }}
        />
      ) : (
        <DataTable
          columns={columns as any}
          data={receptions}
          page={page}
          totalPages={pagination?.totalPages || 1}
          onPageChange={setPage}
          onRowClick={(row: any) => router.push(`/recepcion/${row.id}`)}
        />
      )}
    </div>
  );
}