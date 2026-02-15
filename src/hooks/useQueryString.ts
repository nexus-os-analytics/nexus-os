import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useQueryString() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const getQueryParam = (key: string): string | null => {
    return searchParams.get(key);
  };

  const getAllQueryParams = (): Record<string, string> => {
    const entries: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      entries[key] = value;
    });
    return entries;
  };

  const setQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const setQueryParams = (paramsObj: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(paramsObj).filter(
      ([_, value]) => value !== undefined && value !== 'undefined'
    )) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearQueryParams = () => {
    router.replace(pathname);
  };

  return {
    getQueryParam,
    getAllQueryParams,
    setQueryParam,
    setQueryParams,
    clearQueryParams,
  };
}
