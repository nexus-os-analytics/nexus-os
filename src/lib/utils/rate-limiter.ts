import pLimit from 'p-limit';

/**
 * Sleep for a given number of milliseconds.
 * @param ms milliseconds to sleep
 * @returns
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RateLimiterOptions {
  concurrency: number;
  maxPerSecond: number;
}

/**
 * Factory function to create a rate limiter with custom settings.
 * Ensures maximum concurrency and maximum requests per second.
 *
 * @param options - Rate limiter configuration
 * @returns A rate-limited function executor
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const { concurrency, maxPerSecond } = options;
  const limit = pLimit(concurrency);
  let timestamps: number[] = [];

  return async function rateLimited<T>(fn: () => Promise<T>): Promise<T> {
    while (true) {
      const now = Date.now();
      const ONE_SECOND_MS = 1000;
      const MIN_WAIT_MS = 100;
      timestamps = timestamps.filter((t) => now - t < ONE_SECOND_MS);
      if (timestamps.length < maxPerSecond) {
        timestamps.push(now);
        break;
      }
      const wait = ONE_SECOND_MS - (now - timestamps[0]);
      await sleep(wait > 0 ? wait : MIN_WAIT_MS);
    }
    return limit(fn);
  };
}

/**
 * Bling API: recomenda-se <= 3 requests/segundo.
 * Este limitador garante no máximo 3 concorrentes E no máximo 3 requisições por segundo.
 * @deprecated Use createRateLimiter({ concurrency: 3, maxPerSecond: 3 }) instead
 */
const CONCURRENCY = 3;
const MAX_PER_SECOND = 3;
let timestamps: number[] = [];

export const limit = pLimit(CONCURRENCY);

/**
 * Legacy rate limiter for Bling API backward compatibility.
 * @deprecated Use createRateLimiter instead for new integrations
 */
export async function rateLimited<T>(fn: () => Promise<T>): Promise<T> {
  while (true) {
    const now = Date.now();
    const ONE_SECOND_MS = 1000;
    const MIN_WAIT_MS = 100;
    timestamps = timestamps.filter((t) => now - t < ONE_SECOND_MS);
    if (timestamps.length < MAX_PER_SECOND) {
      timestamps.push(now);
      break;
    }
    const wait = ONE_SECOND_MS - (now - timestamps[0]);
    await sleep(wait > 0 ? wait : MIN_WAIT_MS);
  }
  return limit(fn);
}
