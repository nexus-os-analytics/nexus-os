import { useQuery } from '@tanstack/react-query';
import type { GetOverviewMetricsResponse } from '@/features/products/types';

export function useOverviewMetrics() {
  return useQuery<GetOverviewMetricsResponse, Error>({
    queryKey: ['overview-metrics'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/overview-metrics');
      if (!res.ok) throw new Error('Erro ao buscar métricas de visão geral');
      return res.json();
    },
  });
}
