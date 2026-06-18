'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '@/lib/api/suppliers.api';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/tables/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { SupplierForm } from '@/components/forms/supplier-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  Truck, 
  Plus, 
  Search, 
  RefreshCw,
  Pencil,
  Trash2,
  Barcode,
  Mail,
  Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const columns = [
  {
    key: 'codigo',
    header: 'Código',
    cell: (row: any) => (
      <span className="font-mono text-sm font-semibold dark:text-gray-200">{row.codigo}</span>
    ),
  },
  {
    key: 'nombre',
    header: 'Nombre',
    cell: (row: any) => (
      <span className="font-medium dark:text-gray-200">{row.nombre}</span>
    ),
  },
  {
    key: 'contacto',
    header: 'Contacto',
    cell: (row: any) => (
      <div className="space-y-0.5">
        <p className="text-sm dark:text-gray-300">{row.nombreContacto}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-500">
          <Mail className="h-3 w-3" />
          <span>{row.emailContacto}</span>
        </div>
        {row.telefonoContacto && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-500">
            <Phone className="h-3 w-3" />
            <span>{row.telefonoContacto}</span>
          </div>
        )}
      </div>
    ),
  },
  {
    key: 'utilizaCodigoBarras',
    header: 'Cód. Barras',
    cell: (row: any) => (
      row.utilizaCodigoBarras ? (
        <Badge variant="success" className="text-xs gap-1">
          <Barcode className="h-3 w-3" />
          Sí
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground dark:text-gray-500">No</span>
      )
    ),
  },
  {
    key: 'acciones',
    header: '',
    cell: (row: any, _idx: number, onEdit: any, onDelete: any) => (
      <div className="flex items-center gap-1 justify-end">
        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onEdit(row); }}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onDelete(row); }} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export default function ProveedoresConfigPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<any>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['suppliers-config', page, debouncedSearch],
    queryFn: () => suppliersApi.getAll({ page, limit: 10, search: debouncedSearch }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => suppliersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers-config'] });
      toast({ title: 'Proveedor desactivado', variant: 'success' });
      setShowDeleteConfirm(false);
    },
  });

  const suppliers = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const handleEdit = (s: any) => { setSelectedSupplier(s); setShowForm(true); };
  const handleDelete = (s: any) => { setSupplierToDelete(s); setShowDeleteConfirm(true); };

  return (
    <div className="space-y-6">
      <PageHeader title="Proveedores" description="Gestión de proveedores">
        <Button onClick={() => { setSelectedSupplier(null); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Nuevo Proveedor
        </Button>
      </PageHeader>

      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 dark:border-gray-700 dark:bg-gray-800" />
            </div>
            <Button variant="outline" size="icon" onClick={() => refetch()} className="dark:border-gray-700">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="dark:border-gray-800 dark:bg-gray-900"><CardContent className="p-6"><div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div></CardContent></Card>
      ) : isError ? (
        <EmptyState icon={<Truck className="h-10 w-10" />} title="Error" action={{ label: 'Reintentar', onClick: () => refetch() }} />
      ) : suppliers.length === 0 ? (
        <EmptyState icon={<Truck className="h-10 w-10" />} title="Sin proveedores" action={{ label: 'Nuevo', onClick: () => { setSelectedSupplier(null); setShowForm(true); } }} />
      ) : (
        <DataTable columns={columns as any} data={suppliers} page={page} totalPages={pagination?.totalPages || 1} onPageChange={setPage} extraActions={{ onEdit: handleEdit, onDelete: handleDelete }} />
      )}

      <SupplierForm open={showForm} onClose={() => { setShowForm(false); refetch(); }} supplier={selectedSupplier} />
      <ConfirmDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} title="Desactivar" description={`¿Desactivar ${supplierToDelete?.nombre}?`} confirmLabel="Desactivar" variant="destructive" onConfirm={() => supplierToDelete && deleteMutation.mutate(supplierToDelete.id)} isLoading={deleteMutation.isPending} />
    </div>
  );
}