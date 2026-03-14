import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';
import type { GetOverviewMetricsResponse } from '@/features/products/types';

type OverviewMetricsParams = {
  provider?: string;
};

export function useOverviewMetrics(params?: OverviewMetricsParams) {
  return useQuery<GetOverviewMetricsResponse, Error>({
    queryKey: ['overview-metrics', { ...params }],
    queryFn: async () => {
      const query = queryString.stringify({ ...params });
      const url = query
        ? `/api/dashboard/overview-metrics?${query}`
        : '/api/dashboard/overview-metrics';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro ao buscar métricas de visão geral');
      return res.json();
    },
  });
}
