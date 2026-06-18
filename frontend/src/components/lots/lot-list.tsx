'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LotCard } from './lot-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { 
  Package, 
  Search, 
  Filter,
  RefreshCw,
  LayoutGrid,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import api from '@/lib/axios';
import type { Lot, LotFilters } from '@/types/lot.types';

interface LotListProps {
  filters?: LotFilters;
  onLotClick?: (lot: Lot) => void;
  className?: string;
  viewMode?: 'grid' | 'list';
}

export function LotList({ filters: initialFilters, onLotClick, className, viewMode: initialViewMode = 'grid' }: LotListProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [estado, setEstado] = useState(initialFilters?.estado || '');
  const [viewMode, setViewMode] = useState(initialViewMode);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['lots', page, debouncedSearch, estado, initialFilters],
    queryFn: () =>
      api.get('/lots', {
        params: {
          page,
          limit: viewMode === 'grid' ? 12 : 20,
          search: debouncedSearch,
          estado: estado || undefined,
          ...initialFilters,
        },
      }).then((res) => res.data),
  });

  const lots = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar lote por código..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 font-mono"
            />
          </div>
          <Select value={estado} onValueChange={(v) => { setEstado(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="ACTIVO">Activo</SelectItem>
              <SelectItem value="VENCIDO">Vencido</SelectItem>
              <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
              <SelectItem value="RETIRADO">Retirado</SelectItem>
              <SelectItem value="CONSUMIDO">Consumido</SelectItem>
              <SelectItem value="ENTREGADO">Entregado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => refetch()} title="Actualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => setViewMode('grid')}
            title="Vista cuadrícula"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => setViewMode('list')}
            title="Vista lista"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className={cn(
          viewMode === 'grid'
            ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
            : 'space-y-2'
        )}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={viewMode === 'grid' ? 'h-[180px]' : 'h-20'} />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <EmptyState
          icon={<Package className="h-10 w-10" />}
          title="Error al cargar lotes"
          description="No se pudieron cargar los datos"
          action={{ label: 'Reintentar', onClick: () => refetch() }}
        />
      )}

      {/* Empty */}
      {!isLoading && !isError && lots.length === 0 && (
        <EmptyState
          icon={<Package className="h-10 w-10" />}
          title="No se encontraron lotes"
          description={search ? `Sin resultados para "${search}"` : 'No hay lotes registrados'}
        />
      )}

      {/* Grid / List */}
      {!isLoading && !isError && lots.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lots.map((lot: Lot) => (
                <LotCard key={lot.id} lot={lot} onClick={() => onLotClick?.(lot)} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {lots.map((lot: Lot) => (
                <LotCard key={lot.id} lot={lot} onClick={() => onLotClick?.(lot)} />
              ))}
            </div>
          )}

          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Página {page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}