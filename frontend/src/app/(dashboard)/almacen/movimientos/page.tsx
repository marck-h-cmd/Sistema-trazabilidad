'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api/inventory.api';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/tables/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { StatusBadge } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  ArrowRightLeft, 
  Search, 
  Filter,
  Plus,
  MoveRight,
} from 'lucide-react';
import { formatDateTime, formatNumber } from '@/lib/formatters';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';

const moveSchema = z.object({
  loteId: z.string().min(1, 'Ingrese código de lote'),
  ubicacionDestinoId: z.string().min(1, 'Seleccione ubicación destino'),
  cantidad: z.coerce.number().min(0.01, 'Cantidad mínima 0.01'),
  observaciones: z.string().optional(),
});

type MoveForm = z.infer<typeof moveSchema>;

const columns = [
  {
    key: 'lote',
    header: 'Lote',
    cell: (row: any) => (
      <span className="font-mono text-sm font-semibold dark:text-gray-200">{row.lote?.codigo || 'N/A'}</span>
    ),
  },
  {
    key: 'tipo',
    header: 'Tipo',
    cell: (row: any) => <StatusBadge status={row.tipo} />,
  },
  {
    key: 'origen',
    header: 'Origen',
    cell: (row: any) => row.ubicacionOrigen?.codigoCompleto || 'N/A',
  },
  {
    key: 'destino',
    header: 'Destino',
    cell: (row: any) => row.ubicacionDestino?.codigoCompleto || 'N/A',
  },
  {
    key: 'cantidad',
    header: 'Cantidad',
    cell: (row: any) => formatNumber(row.cantidad) + ' ' + (row.unidadMedida || ''),
  },
  {
    key: 'fecha',
    header: 'Fecha',
    cell: (row: any) => formatDateTime(row.creadoEn),
  },
];

export default function MovimientosPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [openMove, setOpenMove] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['movements', page, debouncedSearch, tipoFilter],
    queryFn: () =>
      inventoryApi.getMovements({
        page,
        limit: 15,
        search: debouncedSearch,
        tipo: tipoFilter || undefined,
      }),
  });

  const movements = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MoveForm>({
    resolver: zodResolver(moveSchema),
  });

  const moveMutation = useMutation({
    mutationFn: (data: MoveForm) => inventoryApi.moveLot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      toast({ title: 'Lote movido exitosamente', variant: 'success' });
      reset();
      setOpenMove(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al mover lote',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimientos de Lotes"
        description="Historial de movimientos y traslados"
      >
        <Dialog open={openMove} onOpenChange={setOpenMove}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Mover Lote
            </Button>
          </DialogTrigger>
          <DialogContent className="dark:border-gray-800 dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-100">Mover Lote</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit((data) => moveMutation.mutate(data))} className="space-y-4">
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Código de Lote *</Label>
                <Input placeholder="Escanear o escribir código" className="font-mono" {...register('loteId')} />
                {errors.loteId && <p className="text-xs text-destructive">{errors.loteId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Ubicación Destino *</Label>
                <Input placeholder="Código de ubicación" {...register('ubicacionDestinoId')} />
                {errors.ubicacionDestinoId && <p className="text-xs text-destructive">{errors.ubicacionDestinoId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Cantidad *</Label>
                <Input type="number" step="0.01" {...register('cantidad')} />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Observaciones</Label>
                <Input {...register('observaciones')} />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={moveMutation.isPending}>
                <MoveRight className="h-4 w-4" />
                {moveMutation.isPending ? 'Moviendo...' : 'Mover Lote'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por lote..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 dark:border-gray-700"
              />
            </div>
            <Select value={tipoFilter} onValueChange={(v) => { setTipoFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="RECEPCION">Recepción</SelectItem>
                <SelectItem value="PRODUCCION">Producción</SelectItem>
                <SelectItem value="MOVIMIENTO_INTERNO">Mov. Interno</SelectItem>
                <SelectItem value="EXPEDICION">Expedición</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : isError ? (
        <EmptyState
          icon={<ArrowRightLeft className="h-10 w-10" />}
          title="Error al cargar movimientos"
          action={{ label: 'Reintentar', onClick: () => refetch() }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={movements}
          page={page}
          totalPages={pagination?.totalPages || 1}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}