import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryString } from './useQueryString';

const SEARCH_DEBOUNCE_INTERVAL = 300;

type UseFiltersOptions<T extends object> = {
  initialFilters: T;
  debounceKey?: keyof T;
  hasFilterKeys?: (keyof T)[];
  onFilter: (filters: T) => void;
  onClear: () => void;
  onFiltersChange: React.Dispatch<React.SetStateAction<T>>;
};

export function useFilters<T extends Record<string, unknown>>({
  initialFilters,
  debounceKey = 'search',
  hasFilterKeys = ['search'] as (keyof T)[],
  onFilter,
  onClear,
  onFiltersChange,
}: UseFiltersOptions<T>) {
  const [filters, setFilters] = useState<T>(initialFilters);
  const { setQueryParams, getAllQueryParams } = useQueryString();
  const [debounced] = useDebouncedValue(filters[debounceKey] ?? '', SEARCH_DEBOUNCE_INTERVAL);
  const isInitialized = useRef(false);

  const hasFilters = useMemo(() => {
    return hasFilterKeys.some((key) => {
      const value = filters[key];
      return value !== undefined && value !== null && value !== '';
    });
  }, [filters, hasFilterKeys]);

  const setFilter = (key: keyof T, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value ?? '' }));
    if (debounceKey === key) {
      onFilter({ ...filters, [key]: value ?? '' });
    }
  };

  const apply = () => {
    onFiltersChange(filters);
    setQueryParams(filters as Record<string, string>);

    if (hasFilters) onFilter(filters);
    else onClear();
  };

  const clear = () => {
    const cleared = Object.keys(initialFilters).reduce(
      (acc, key) => ({ ...acc, [key]: '' }),
      {} as T
    );
    onFiltersChange(cleared);
    setFilters(cleared);
    setQueryParams(cleared as Record<string, string>);
    onClear();
  };

  useEffect(() => {
    if (!isInitialized.current) {
      const params = getAllQueryParams();
      const urlFilters = { ...initialFilters, ...params } as T;

      if (hasFilterKeys.some((key) => urlFilters[key])) {
        onFilter(urlFilters);
      }

      setFilters(urlFilters);
      onFiltersChange(urlFilters);
      isInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (isInitialized.current && debounceKey in filters) {
      onFilter({ ...filters, [debounceKey]: debounced });
    }
  }, [debounced]);

  return {
    filters,
    hasFilters,
    setFilter,
    apply,
    clear,
  };
}
