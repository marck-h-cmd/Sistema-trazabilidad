'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { LotList } from '@/components/lots/lot-list';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { WarehouseMap } from '@/components/warehouse/warehouse-map';
import { LocationPicker } from '@/components/warehouse/location-picker';
import { useDebounce } from '@/hooks/use-debounce';
import { useWarehouseStore } from '@/stores/warehouse.store';
import { 
  Package, 
  Search, 
  Filter,
  LayoutGrid,
  List,
  MapPin,
  ArrowRightLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function InventarioPage() {
  const router = useRouter();
  const { viewMode, setViewMode } = useWarehouseStore();
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario"
        description="Gestión completa del inventario de lotes"
      >
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => setViewMode('grid')}
            className="dark:border-gray-700"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => setViewMode('list')}
            className="dark:border-gray-700"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/almacen/movimientos">
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Mover Lote
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar lote por código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 font-mono dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger className="w-[160px] dark:border-gray-700">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="VENCIDO">Vencido</SelectItem>
                <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
                <SelectItem value="RETIRADO">Retirado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <LotList
        filters={{ search: debouncedSearch, estado }}
        onLotClick={(lot) => router.push(`/trazabilidad/${lot.codigo}`)}
        viewMode={viewMode === 'map' ? 'grid' : viewMode}
      />
    </div>
  );
}