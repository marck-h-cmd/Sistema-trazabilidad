'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import api from '@/lib/axios';

export function useLot(lotId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: lot, isLoading, isError, refetch } = useQuery({
    queryKey: ['lot', lotId],
    queryFn: () => api.get(`/lots/${lotId}`).then((res) => res.data.data),
    enabled: !!lotId,
  });

  const updateLotMutation = useMutation({
    mutationFn: (data: any) => api.put(`/lots/${lotId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lot', lotId] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      toast({ title: 'Lote actualizado', variant: 'success' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al actualizar lote',
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (estado: string) => api.put(`/lots/${lotId}/status`, { estado }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lot', lotId] });
      toast({ title: 'Estado actualizado', variant: 'success' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al cambiar estado',
        variant: 'destructive',
      });
    },
  });

  return {
    lot,
    isLoading,
    isError,
    refetch,
    updateLot: updateLotMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateLotMutation.isPending,
  };
}

export function useLots(params?: Record<string, any>) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['lots', params],
    queryFn: () =>
      api
        .get('/lots', { params })
        .then((res) => res.data),
  });

  return {
    lots: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError,
    refetch,
  };
}