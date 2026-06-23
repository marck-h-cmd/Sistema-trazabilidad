'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { warehousesApi } from '@/lib/api/warehouses.api';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LocationForm } from '@/components/forms/location-form';
import { WarehouseForm } from '@/components/forms/warehouse-form';
import { LocationPicker } from '@/components/warehouse/location-picker';
import { 
  MapPin, 
  Plus,
  Warehouse,
  ChevronRight,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export default function UbicacionesPage() {
  const [showNewWarehouse, setShowNewWarehouse] = useState(false);
  const [showNewLocation, setShowNewLocation] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryAlmacenId = params.get('almacenId');
      if (queryAlmacenId) {
        setSelectedWarehouse(queryAlmacenId);
      }
    }
  }, []);

  const { data: warehouses, isLoading, refetch } = useQuery({
    queryKey: ['warehouses', 'full'],
    queryFn: () => warehousesApi.getAll({ limit: 100 }),
  });

  const { data: selectedWarehouseData } = useQuery({
    queryKey: ['warehouses', 'detail', selectedWarehouse],
    queryFn: () => warehousesApi.getById(selectedWarehouse!),
    enabled: !!selectedWarehouse,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ubicaciones"
        description="Gestión de almacenes y ubicaciones"
      >
        <div className="flex gap-2">
          <Button size="sm" className="gap-2" onClick={() => setShowNewWarehouse(true)}>
            <Warehouse className="h-4 w-4" />
            Nuevo Almacén
          </Button>
          <Button size="sm" variant="outline" className="gap-2 dark:border-gray-700" onClick={() => setShowNewLocation(true)}>
            <Plus className="h-4 w-4" />
            Nueva Ubicación
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista de almacenes */}
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
              <Warehouse className="h-4 w-4 text-primary" />
              Almacenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : warehouses?.data?.data?.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground dark:text-gray-500">
                No hay almacenes creados
              </div>
            ) : (
              <div className="space-y-2">
                {warehouses?.data?.data?.map((warehouse: any) => (
                  <div
                    key={warehouse.id}
                    className={cn(
                      'flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all hover:bg-muted/50 dark:border-gray-700 dark:hover:bg-gray-800',
                      selectedWarehouse === warehouse.id && 'border-primary bg-primary/5 dark:border-primary dark:bg-primary/10'
                    )}
                    onClick={() => setSelectedWarehouse(warehouse.id)}
                  >
                    <div>
                      <p className="text-sm font-medium dark:text-gray-200">{warehouse.nombre}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs dark:border-gray-600">{warehouse.tipo}</Badge>
                        <span className="text-xs text-muted-foreground dark:text-gray-500">
                          {warehouse.ubicaciones?.length || 0} ubicaciones
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ubicaciones del almacén seleccionado */}
        <Card className="lg:col-span-2 dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
              <MapPin className="h-4 w-4 text-primary" />
              {selectedWarehouseData?.data?.data?.nombre || 'Seleccione un almacén'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedWarehouse ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="mb-3 h-10 w-10 text-muted-foreground dark:text-gray-600" />
                <p className="text-sm text-muted-foreground dark:text-gray-500">
                  Seleccione un almacén para ver sus ubicaciones
                </p>
              </div>
            ) : selectedWarehouseData?.data?.data?.ubicaciones?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MapPin className="mb-3 h-10 w-10 text-muted-foreground dark:text-gray-600" />
                <p className="text-sm text-muted-foreground dark:text-gray-500">
                  Este almacén no tiene ubicaciones
                </p>
                <Button size="sm" className="mt-4 gap-2" onClick={() => setShowNewLocation(true)}>
                  <Plus className="h-4 w-4" />
                  Crear ubicación
                </Button>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {selectedWarehouseData?.data?.data?.ubicaciones?.map((loc: any) => (
                  <div
                    key={loc.id}
                    className="rounded-lg border p-3 dark:border-gray-700 hover:bg-muted/50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <p className="font-mono text-xs font-semibold dark:text-gray-200">{loc.codigoCompleto}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] dark:border-gray-600">
                        Cap: {loc.capacidadMaxima || 'N/A'}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground dark:text-gray-500">
                        Ocup: {loc.capacidadActual || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      {showNewWarehouse && (
        <WarehouseForm open={showNewWarehouse} onClose={() => { setShowNewWarehouse(false); refetch(); }} />
      )}
      {showNewLocation && (
        <LocationForm
          open={showNewLocation}
          onClose={() => { setShowNewLocation(false); refetch(); }}
          warehouseId={selectedWarehouse || ''}
        />
      )}
    </div>
  );
}