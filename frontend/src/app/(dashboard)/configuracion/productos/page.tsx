'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products.api';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/tables/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ProductForm } from '@/components/forms/product-form';
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
  Package, 
  Plus, 
  Search, 
  RefreshCw,
  Filter,
  Pencil,
  Trash2,
  Thermometer,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

const columns = [
  {
    key: 'sku',
    header: 'SKU',
    cell: (row: any) => (
      <span className="font-mono text-sm font-semibold dark:text-gray-200">{row.sku}</span>
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
    key: 'categoria',
    header: 'Categoría',
    cell: (row: any) => {
      const labels: Record<string, string> = {
        MATERIA_PRIMA: 'Materia Prima',
        PRODUCTO_TERMINADO: 'Prod. Terminado',
        ENVASE: 'Envase',
        SEMIELABORADO: 'Semielaborado',
      };
      const colors: Record<string, string> = {
        MATERIA_PRIMA: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        PRODUCTO_TERMINADO: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        ENVASE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        SEMIELABORADO: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      };
      return (
        <Badge className={cn('text-xs', colors[row.categoria] || '')}>
          {labels[row.categoria] || row.categoria}
        </Badge>
      );
    },
  },
  {
    key: 'unidadMedida',
    header: 'Unidad',
    cell: (row: any) => <span className="text-sm dark:text-gray-300">{row.unidadMedida}</span>,
  },
  {
    key: 'vidaUtilDias',
    header: 'Vida Útil',
    cell: (row: any) => (
      <span className="text-sm dark:text-gray-300">{row.vidaUtilDias} días</span>
    ),
  },
  {
    key: 'requiereCadenaFrio',
    header: 'Cadena Frío',
    cell: (row: any) => (
      row.requiereCadenaFrio ? (
        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
          <Thermometer className="h-4 w-4" />
          <span className="text-xs">Sí</span>
        </div>
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

export default function ProductosConfigPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', 'config', page, debouncedSearch, categoriaFilter],
    queryFn: () =>
      productsApi.getAll({
        page,
        limit: 10,
        search: debouncedSearch,
        categoria: categoriaFilter || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Producto desactivado', variant: 'success' });
      setShowDeleteConfirm(false);
    },
  });

  const products = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDelete = (product: any) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Catálogo de productos y materias primas"
      >
        <Button onClick={() => { setSelectedProduct(null); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </Button>
      </PageHeader>

      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, SKU..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <Select value={categoriaFilter} onValueChange={(v) => { setCategoriaFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[180px] dark:border-gray-700">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="MATERIA_PRIMA">Materia Prima</SelectItem>
                <SelectItem value="PRODUCTO_TERMINADO">Producto Terminado</SelectItem>
                <SelectItem value="ENVASE">Envase</SelectItem>
                <SelectItem value="SEMIELABORADO">Semielaborado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => refetch()} className="dark:border-gray-700">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

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
          title="Error al cargar productos"
          action={{ label: 'Reintentar', onClick: () => refetch() }}
        />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-10 w-10" />}
          title="No hay productos"
          action={{ label: 'Nuevo Producto', onClick: () => { setSelectedProduct(null); setShowForm(true); } }}
        />
      ) : (
        <DataTable
          columns={columns as any}
          data={products}
          page={page}
          totalPages={pagination?.totalPages || 1}
          onPageChange={setPage}
          extraActions={{ onEdit: handleEdit, onDelete: handleDelete }}
        />
      )}

      {showForm && (
        <ProductForm open={showForm} onClose={() => { setShowForm(false); refetch(); }} product={selectedProduct} />
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Desactivar Producto"
        description={`¿Desactivar ${productToDelete?.nombre}?`}
        confirmLabel="Desactivar"
        variant="destructive"
        onConfirm={() => productToDelete && deleteMutation.mutate(productToDelete.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}