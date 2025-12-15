import { useInfiniteQuery } from '@tanstack/react-query';
import type { DashboardAlertsResponse } from '../types';

export function useAlertsQuery(filter: string | null) {
  return useInfiniteQuery<DashboardAlertsResponse>({
    queryKey: ['alerts', filter],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/alerts?page=${pageParam}&filter=${filter ?? ''}`);
      if (!res.ok) throw new Error('Erro ao buscar alertas');
      return res.json();
    },
    getNextPageParam: ({ pagination }) => {
      if (!pagination.hasNextPage) return undefined;
      return pagination.nextCursor;
    },
    initialPageParam: 1,
  });
}
