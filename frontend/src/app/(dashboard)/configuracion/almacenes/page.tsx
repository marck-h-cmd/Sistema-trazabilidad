'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehousesApi } from '@/lib/api/warehouses.api';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { WarehouseForm } from '@/components/forms/warehouse-form';
import { LocationForm } from '@/components/forms/location-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { 
  Warehouse, 
  Plus, 
  Pencil,
  Trash2,
  MapPin,
  ChevronRight,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AlmacenesConfigPage() {
  const queryClient = useQueryClient();
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [selectedLocationWarehouse, setSelectedLocationWarehouse] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<any>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['warehouses', 'config'],
    queryFn: () => warehousesApi.getAll({ limit: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => warehousesApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['warehouses'] }); toast({ title: 'Almacén desactivado', variant: 'success' }); },
  });

  const warehouses = data?.data?.data || [];

  const handleEdit = (w: any) => { setSelectedWarehouse(w); setShowWarehouseForm(true); };
  const handleDelete = (w: any) => { setWarehouseToDelete(w); setShowDeleteConfirm(true); };

  return (
    <div className="space-y-6">
      <PageHeader title="Almacenes" description="Gestión de almacenes">
        <Button onClick={() => { setSelectedWarehouse(null); setShowWarehouseForm(true); }} className="gap-2"><Plus className="h-4 w-4" /> Nuevo Almacén</Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : isError ? (
        <EmptyState icon={<Warehouse className="h-10 w-10" />} title="Error" action={{ label: 'Reintentar', onClick: () => refetch() }} />
      ) : warehouses.length === 0 ? (
        <EmptyState icon={<Warehouse className="h-10 w-10" />} title="Sin almacenes" action={{ label: 'Nuevo', onClick: () => { setSelectedWarehouse(null); setShowWarehouseForm(true); } }} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {warehouses.map((w: any) => (
            <Card key={w.id} className="dark:border-gray-800 dark:bg-gray-900">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base dark:text-gray-100">{w.nombre}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs dark:border-gray-600">{w.tipo}</Badge>
                    <span className="text-xs text-muted-foreground dark:text-gray-500">{w.ubicaciones?.length || 0} ubicaciones</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(w)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(w)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5 dark:border-gray-700 text-xs" onClick={() => { setSelectedLocationWarehouse(w.id); setShowLocationForm(true); }}>
                  <MapPin className="h-3.5 w-3.5" /> Agregar Ubicación
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1.5 dark:border-gray-700 text-xs text-primary hover:text-primary" asChild>
                  <Link href={`/almacen/ubicaciones?almacenId=${w.id}`}>
                    <Eye className="h-3.5 w-3.5" /> Ver Ubicaciones
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showWarehouseForm && (
        <WarehouseForm open={showWarehouseForm} onClose={() => { setShowWarehouseForm(false); refetch(); }} warehouse={selectedWarehouse} />
      )}
      {showLocationForm && (
        <LocationForm open={showLocationForm} onClose={() => { setShowLocationForm(false); refetch(); }} warehouseId={selectedLocationWarehouse} />
      )}
      <ConfirmDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} title="Desactivar" description={`¿Desactivar ${warehouseToDelete?.nombre}?`} confirmLabel="Desactivar" variant="destructive" onConfirm={() => warehouseToDelete && deleteMutation.mutate(warehouseToDelete.id)} isLoading={deleteMutation.isPending} />
    </div>
  );
}