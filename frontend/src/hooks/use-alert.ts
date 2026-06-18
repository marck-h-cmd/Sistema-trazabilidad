'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '@/lib/api/alerts.api';
import { useToast } from './use-toast';

export function useAlert(alertId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alert, isLoading, refetch } = useQuery({
    queryKey: ['alert', alertId],
    queryFn: () => alertsApi.getById(alertId!).then((res) => res.data.data),
    enabled: !!alertId,
  });

  const activateMutation = useMutation({
    mutationFn: () => alertsApi.activate(alertId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert', alertId] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast({ title: 'Alerta activada', description: 'Los lotes afectados han sido bloqueados' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al activar alerta',
        variant: 'destructive',
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (resolucion: string) => alertsApi.resolve(alertId!, { resolucion }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert', alertId] });
      toast({ title: 'Alerta resuelta', variant: 'success' });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => alertsApi.close(alertId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert', alertId] });
      toast({ title: 'Alerta cerrada', variant: 'success' });
    },
  });

  return {
    alert,
    isLoading,
    refetch,
    activate: activateMutation.mutate,
    resolve: resolveMutation.mutate,
    close: closeMutation.mutate,
    isActivating: activateMutation.isPending,
    isResolving: resolveMutation.isPending,
    isClosing: closeMutation.isPending,
  };
}

export function useAlerts(params?: Record<string, any>) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['alerts', params],
    queryFn: () => alertsApi.getAll(params).then((res) => res.data),
  });

  return {
    alerts: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError,
    refetch,
  };
}