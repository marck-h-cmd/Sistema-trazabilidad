'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/customers.api';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/tables/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { CustomerForm } from '@/components/forms/customer-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  Store, 
  Plus, 
  Search, 
  RefreshCw,
  Filter,
  Pencil,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TIPO_LABELS: Record<string, string> = {
  BODEGA: 'Bodega',
  SUPERMERCADO: 'Supermercado',
  TIENDA: 'Tienda',
  RESTAURANTE: 'Restaurante',
  DISTRIBUIDOR: 'Distribuidor',
};

const columns = [
  {
    key: 'codigo',
    header: 'Código',
    cell: (row: any) => <span className="font-mono text-sm font-semibold dark:text-gray-200">{row.codigo}</span>,
  },
  {
    key: 'nombre',
    header: 'Nombre',
    cell: (row: any) => <span className="font-medium dark:text-gray-200">{row.nombre}</span>,
  },
  {
    key: 'tipo',
    header: 'Tipo',
    cell: (row: any) => (
      <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
        {TIPO_LABELS[row.tipo] || row.tipo}
      </Badge>
    ),
  },
  {
    key: 'ciudad',
    header: 'Ciudad',
    cell: (row: any) => <span className="text-sm dark:text-gray-300">{row.ciudad}</span>,
  },
  {
    key: 'acciones',
    header: '',
    cell: (row: any, _idx: number, onEdit: any, onDelete: any) => (
      <div className="flex items-center gap-1 justify-end">
        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onEdit(row); }}><Pencil className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onDelete(row); }} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
      </div>
    ),
  },
];

export default function ClientesConfigPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers-config', page, debouncedSearch, tipoFilter],
    queryFn: () => customersApi.getAll({ page, limit: 10, search: debouncedSearch, tipo: tipoFilter || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers-config'] }); toast({ title: 'Cliente desactivado', variant: 'success' }); setShowDeleteConfirm(false); },
  });

  const customers = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const handleEdit = (c: any) => { setSelectedCustomer(c); setShowForm(true); };
  const handleDelete = (c: any) => { setCustomerToDelete(c); setShowDeleteConfirm(true); };

  return (
    <div className="space-y-6">
      <PageHeader title="Clientes" description="Gestión de clientes">
        <Button onClick={() => { setSelectedCustomer(null); setShowForm(true); }} className="gap-2"><Plus className="h-4 w-4" /> Nuevo Cliente</Button>
      </PageHeader>
      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Buscar..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 dark:border-gray-700 dark:bg-gray-800" /></div>
            <Select value={tipoFilter} onValueChange={(v) => { setTipoFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px] dark:border-gray-700"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>{Object.entries(TIPO_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => refetch()} className="dark:border-gray-700"><RefreshCw className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
      {isLoading ? <Card><CardContent className="p-6"><div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div></CardContent></Card> :
       isError ? <EmptyState icon={<Store className="h-10 w-10" />} title="Error" action={{ label: 'Reintentar', onClick: () => refetch() }} /> :
       customers.length === 0 ? <EmptyState icon={<Store className="h-10 w-10" />} title="Sin clientes" action={{ label: 'Nuevo', onClick: () => { setSelectedCustomer(null); setShowForm(true); } }} /> :
       <DataTable columns={columns} data={customers} page={page} totalPages={pagination?.totalPages || 1} onPageChange={setPage} extraActions={{ onEdit: handleEdit, onDelete: handleDelete }} />}
      <CustomerForm open={showForm} onClose={() => { setShowForm(false); refetch(); }} customer={selectedCustomer} />
      <ConfirmDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} title="Desactivar" description={`¿Desactivar ${customerToDelete?.nombre}?`} confirmLabel="Desactivar" variant="destructive" onConfirm={() => customerToDelete && deleteMutation.mutate(customerToDelete.id)} isLoading={deleteMutation.isPending} />
    </div>
  );
}