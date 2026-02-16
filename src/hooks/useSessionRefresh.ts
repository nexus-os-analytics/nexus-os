import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSessionRefreshOptions {
  /**
   * Enable automatic polling to refresh session
   * @default false
   */
  enablePolling?: boolean;

  /**
   * Interval between polling attempts in milliseconds
   * @default 3000 (3 seconds)
   */
  pollingInterval?: number;

  /**
   * Maximum duration for polling in milliseconds
   * @default 30000 (30 seconds)
   */
  maxPollingDuration?: number;

  /**
   * Callback when session is successfully updated
   */
  onSessionUpdated?: () => void;

  /**
   * Callback when polling times out
   */
  onTimeout?: () => void;
}

/**
 * Hook to manage session refresh with polling support.
 * Useful for pages where data updates happen asynchronously (e.g., payment confirmation).
 *
 * @example
 * ```tsx
 * const { isRefreshing, refreshSession, stopPolling } = useSessionRefresh({
 *   enablePolling: true,
 *   pollingInterval: 3000,
 *   maxPollingDuration: 30000,
 *   onSessionUpdated: () => console.log('Session updated!'),
 * });
 * ```
 */
export function useSessionRefresh({
  enablePolling = false,
  pollingInterval = 3000,
  maxPollingDuration = 30000,
  onSessionUpdated,
  onTimeout,
}: UseSessionRefreshOptions = {}) {
  const { data: session, update } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const previousPlanTierRef = useRef<string | undefined>(session?.user?.planTier);

  // Track plan tier changes
  useEffect(() => {
    if (session?.user?.planTier && session.user.planTier !== previousPlanTierRef.current) {
      previousPlanTierRef.current = session.user.planTier;
      if (onSessionUpdated) {
        onSessionUpdated();
      }
    }
  }, [session?.user?.planTier, onSessionUpdated]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsRefreshing(false);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await update();
    } catch (error) {
      console.error('Failed to refresh session:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [update]);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      return; // Already polling
    }

    setIsRefreshing(true);
    setHasTimedOut(false);
    startTimeRef.current = Date.now();

    // Initial refresh
    refreshSession();

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;

      if (elapsed >= maxPollingDuration) {
        stopPolling();
        setHasTimedOut(true);
        if (onTimeout) {
          onTimeout();
        }
        return;
      }

      refreshSession();
    }, pollingInterval);

    // Set up timeout
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setHasTimedOut(true);
      if (onTimeout) {
        onTimeout();
      }
    }, maxPollingDuration);
  }, [refreshSession, stopPolling, pollingInterval, maxPollingDuration, onTimeout]);

  // Auto-start polling if enabled
  useEffect(() => {
    if (enablePolling) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enablePolling, startPolling, stopPolling]);

  return {
    session,
    isRefreshing,
    hasTimedOut,
    refreshSession,
    startPolling,
    stopPolling,
  };
}
