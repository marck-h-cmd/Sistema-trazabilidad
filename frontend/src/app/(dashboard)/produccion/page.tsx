'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { productionsApi } from '@/lib/api/productions.api';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/tables/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LotStatusBadge } from '@/components/lots/lot-status-badge';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  Factory, 
  Plus, 
  Search, 
  RefreshCw,
  Download,
  Filter,
  Package,
  TrendingUp,
  Beaker,
} from 'lucide-react';
import { formatDate, formatDateTime, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';

const columns = [
  {
    key: 'lote',
    header: 'Lote',
    cell: (row: any) => (
      <span className="font-mono font-semibold text-primary">{row.lote?.codigo || 'N/A'}</span>
    ),
  },
  {
    key: 'producto',
    header: 'Producto',
    cell: (row: any) => row.lote?.producto?.nombre || 'N/A',
  },
  {
    key: 'linea',
    header: 'Línea',
    cell: (row: any) => (
      <span className="font-mono text-sm">{row.lineaProduccion?.codigo || 'N/A'}</span>
    ),
  },
  {
    key: 'fechaInicio',
    header: 'Inicio',
    sortable: true,
    cell: (row: any) => formatDateTime(row.fechaInicio),
  },
  {
    key: 'rendimiento',
    header: 'Rendimiento',
    cell: (row: any) => (
      <span className={cn(
        'font-medium',
        (row.rendimiento || 0) >= 90 ? 'text-green-600 dark:text-green-400' :
        (row.rendimiento || 0) >= 70 ? 'text-amber-600 dark:text-amber-400' :
        'text-red-600 dark:text-red-400'
      )}>
        {row.rendimiento ? `${row.rendimiento.toFixed(1)}%` : 'N/A'}
      </span>
    ),
  },
];

export default function ProduccionPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [lineaFilter, setLineaFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['productions', page, debouncedSearch, lineaFilter],
    queryFn: () =>
      productionsApi.getAll({
        page,
        limit: 10,
        search: debouncedSearch,
        lineaProduccionId: lineaFilter || undefined,
      }),
  });

  const { data: recentData } = useQuery({
    queryKey: ['productions-recent'],
    queryFn: () => productionsApi.getRecent(100),
  });

  const productions = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const todayProductions = recentData?.data?.data?.filter(
    (p: any) => new Date(p.fechaInicio).toDateString() === new Date().toDateString()
  ).length || 0;

  const avgRendimiento = productions.length > 0
    ? productions.reduce((sum: number, p: any) => sum + (p.rendimiento || 0), 0) / productions.length
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Producción"
        description="Gestione las órdenes de producción y generación de lotes"
      >
        <Button onClick={() => router.push('/produccion/nueva')} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Nueva Producción
        </Button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/30">
              <Factory className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">{todayProductions}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Producciones Hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/30">
              <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">{pagination?.total || 0}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Total Lotes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/30">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">{avgRendimiento.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Rendimiento Promedio</p>
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
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por lote, producto..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
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
          icon={<Factory className="h-10 w-10" />}
          title="Error al cargar producciones"
          action={{ label: 'Reintentar', onClick: () => refetch() }}
        />
      ) : productions.length === 0 ? (
        <EmptyState
          icon={<Factory className="h-10 w-10" />}
          title="No hay producciones"
          description="Comience registrando su primera orden de producción"
          action={{ label: 'Nueva Producción', onClick: () => router.push('/produccion/nueva') }}
        />
      ) : (
        <DataTable
          columns={columns as any}
          data={productions}
          page={page}
          totalPages={pagination?.totalPages || 1}
          onPageChange={setPage}
          onRowClick={(row: any) => router.push(`/produccion/${row.id}`)}
        />
      )}
    </div>
  );
}