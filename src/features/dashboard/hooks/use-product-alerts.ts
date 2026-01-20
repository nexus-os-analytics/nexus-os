import { useInfiniteQuery } from '@tanstack/react-query';
import queryString from 'query-string';
import type { GetProductAlertsResponse } from '@/features/products/types';

type AlertsQueryParams = Record<string, string | number | undefined>;

export function useProductAlerts(params?: AlertsQueryParams) {
  return useInfiniteQuery<GetProductAlertsResponse>({
    queryKey: ['get-product-alerts', { ...params }],
    queryFn: async ({ pageParam = 1 }) => {
      const query = queryString.stringify({
        ...params,
        cursor: pageParam,
      });

      const res = await fetch(`/api/dashboard/alerts?${query}`);
      if (!res.ok) throw new Error('Erro ao buscar alertas');
      return res.json();
    },
    getNextPageParam: ({ hasNextPage, nextCursor }) => {
      if (!hasNextPage) return undefined;
      return nextCursor;
    },
    initialPageParam: 1,
  });
}
