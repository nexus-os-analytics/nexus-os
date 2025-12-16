import { useQuery } from '@tanstack/react-query';

export function useOverviewMetrics() {
  return useQuery({
    queryKey: ['overview-metrics'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/overview-metrics');
      if (!res.ok) throw new Error('Erro ao buscar métricas de visão geral');
      return res.json();
    },
  });
}
