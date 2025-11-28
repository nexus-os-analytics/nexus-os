import { useInfiniteQuery } from '@tanstack/react-query';
import type { InfiniteAlertsResponse } from '../types';

export function useAlertsQuery(filter: string | null) {
  return useInfiniteQuery<InfiniteAlertsResponse>({
    queryKey: ['alerts', filter],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/alerts?page=${pageParam}&filter=${filter ?? ''}`);
      if (!res.ok) throw new Error('Erro ao buscar alertas');
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.nextCursor) return undefined;
      return lastPage.nextCursor;
    },
    initialPageParam: 1,
  });
}
