'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export function useTraceability(code: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['traceability', code],
    queryFn: () => api.get(`/traceability/${code}`).then((res) => res.data.data),
    enabled: !!code,
  });

  return {
    traceabilityData: data,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function usePublicTraceability(code: string) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['public-traceability', code],
    queryFn: () => api.get(`/traceability/public/${code}`).then((res) => res.data.data),
    enabled: !!code,
  });

  return {
    productData: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useBackwardTrace(code: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['backward-trace', code],
    queryFn: () => api.get(`/traceability/${code}/backward`).then((res) => res.data.data),
    enabled: !!code,
  });

  return { backwardData: data, isLoading };
}

export function useForwardTrace(code: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['forward-trace', code],
    queryFn: () => api.get(`/traceability/${code}/forward`).then((res) => res.data.data),
    enabled: !!code,
  });

  return { forwardData: data, isLoading };
}