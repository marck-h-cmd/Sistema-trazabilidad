'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { inventoryApi } from '@/lib/api/inventory.api';
import { warehousesApi } from '@/lib/api/warehouses.api';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { InventoryGrid } from '@/components/warehouse/inventory-grid';
import { WarehouseMap } from '@/components/warehouse/warehouse-map';
import { FifoSuggestions } from '@/components/warehouse/fifo-suggestions';
import { StockLevelIndicator } from '@/components/warehouse/stock-level-indicator';
import { 
  Warehouse, 
  Package, 
  MapPin,
  ArrowRightLeft,
  Clock,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AlmacenPage() {
  const router = useRouter();

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses-list'],
    queryFn: () => warehousesApi.getAll({ limit: 100 }),
  });

  const { data: expiringLotes, isLoading: expiringLoading } = useQuery({
    queryKey: ['expiring-lotes', 7],
    queryFn: () => inventoryApi.getExpiringSoon(7),
    refetchInterval: 300000,
  });

  const { data: recentMovements } = useQuery({
    queryKey: ['recent-movements'],
    queryFn: () => inventoryApi.getMovements({ limit: 5 }),
    refetchInterval: 30000,
  });

  const totalWarehouses = warehouses?.data?.data?.length || 0;
  const totalExpiring = expiringLotes?.data?.data?.length || 0;

  const statsData = {
    totalLotesActivos: 0,
    recepcionesHoy: 0,
    produccionesHoy: 0,
    expedicionesHoy: 0,
    alertasActivas: 0,
    lotesPorVencer: totalExpiring,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Almacén"
        description="Gestión de inventario, ubicaciones y movimientos"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/almacen/ubicaciones">
              <MapPin className="mr-2 h-4 w-4" />
              Ubicaciones
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/almacen/movimientos">
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Movimientos
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
              <Warehouse className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">{totalWarehouses}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Almacenes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">{totalExpiring}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Por Vencer (7d)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/30">
              <ArrowRightLeft className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">{recentMovements?.data?.data?.length || 0}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Movimientos Recientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/30">
              <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-gray-100">
                {warehouses?.data?.data?.reduce((sum: number, w: any) => sum + (w.ubicaciones?.length || 0), 0) || 0}
              </p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">Ubicaciones Totales</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Vista General
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="h-4 w-4" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="fifo" className="gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            FIFO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Próximos a vencer */}
            <Card className="dark:border-gray-800 dark:bg-gray-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Próximos a Vencer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expiringLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : expiringLotes?.data?.data?.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground dark:text-gray-500">
                    <Package className="mx-auto mb-2 h-8 w-8" />
                    No hay lotes próximos a vencer
                  </div>
                ) : (
                  <div className="space-y-2">
                    {expiringLotes?.data?.data?.slice(0, 5).map((lote: any) => (
                      <div
                        key={lote.id}
                        className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 dark:border-gray-700 dark:hover:bg-gray-800"
                        onClick={() => router.push(`/trazabilidad/${lote.codigo}`)}
                      >
                        <div>
                          <p className="font-mono text-sm font-semibold dark:text-gray-200">{lote.codigo}</p>
                          <p className="text-xs text-muted-foreground dark:text-gray-400">{lote.producto?.nombre}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                            {lote.cantidad} {lote.unidadMedida}
                          </p>
                          <p className="text-xs text-muted-foreground dark:text-gray-500">
                            {lote.ubicacion?.codigoCompleto || 'Sin ubicación'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" size="sm" className="mt-3 w-full dark:border-gray-700" asChild>
                  <Link href="/almacen/inventario?filtro=expiring">Ver todos</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Stock por nivel */}
            <Card className="dark:border-gray-800 dark:bg-gray-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Niveles de Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StockLevelIndicator productoId="" stock={120} stockMinimo={50} stockMaximo={200} />
                <StockLevelIndicator productoId="" stock={8} stockMinimo={10} stockMaximo={50} />
                <StockLevelIndicator productoId="" stock={0} stockMinimo={5} stockMaximo={30} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="p-6 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-semibold dark:text-gray-200">Inventario Completo</h3>
              <p className="mt-2 text-muted-foreground dark:text-gray-400">
                Acceda al inventario detallado para buscar, filtrar y gestionar lotes
              </p>
              <Button className="mt-4" asChild>
                <Link href="/almacen/inventario">Ver Inventario Completo</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fifo" className="mt-4">
          <FifoSuggestions
            productoId=""
            cantidadNecesaria={100}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}