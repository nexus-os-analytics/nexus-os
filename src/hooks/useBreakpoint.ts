import { useMediaQuery } from '@mantine/hooks';

/**
 * Custom hook for common breakpoint queries
 * Uses Mantine's theme breakpoints: xs: 36em (576px), sm: 48em (768px), md: 62em (992px), lg: 75em (1200px), xl: 88em (1408px)
 */
export function useBreakpoint() {
  const isMobile = useMediaQuery('(max-width: 48em)'); // Below sm
  const isTablet = useMediaQuery('(min-width: 48em) and (max-width: 62em)'); // sm to md
  const isDesktop = useMediaQuery('(min-width: 62em)'); // md and above
  const isLargeDesktop = useMediaQuery('(min-width: 75em)'); // lg and above

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    // Specific breakpoint checks
    isXs: useMediaQuery('(max-width: 36em)'),
    isSm: useMediaQuery('(min-width: 36em) and (max-width: 48em)'),
    isMd: useMediaQuery('(min-width: 48em) and (max-width: 62em)'),
    isLg: useMediaQuery('(min-width: 62em) and (max-width: 75em)'),
    isXl: useMediaQuery('(min-width: 75em)'),
  };
}
