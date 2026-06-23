'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api/inventory.api';
import { warehousesApi } from '@/lib/api/warehouses.api';
import { useToast } from './use-toast';

export function useWarehouse(warehouseId?: string) {
  const { data: warehouse, isLoading } = useQuery({
    queryKey: ['warehouses', 'detail', warehouseId],
    queryFn: () => warehousesApi.getById(warehouseId!).then((res) => res.data.data),
    enabled: !!warehouseId,
  });

  const { data: locations } = useQuery({
    queryKey: ['locations', 'by-warehouse', warehouseId],
    queryFn: () => warehousesApi.getLocations(warehouseId!).then((res) => res.data.data),
    enabled: !!warehouseId,
  });

  return { warehouse, locations, isLoading };
}

export function useInventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const moveMutation = useMutation({
    mutationFn: (data: any) => inventoryApi.moveLot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      toast({ title: 'Lote movido exitosamente', variant: 'success' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al mover lote',
        description: error.response?.data?.error?.message,
        variant: 'destructive',
      });
    },
  });

  return {
    moveLot: moveMutation.mutate,
    isMoving: moveMutation.isPending,
  };
}

export function useExpiringLotes(dias: number = 7) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['expiring-lotes', dias],
    queryFn: () => inventoryApi.getExpiringSoon(dias).then((res) => res.data.data),
    refetchInterval: 300000,
  });

  return { expiringLotes: data || [], isLoading, refetch };
}