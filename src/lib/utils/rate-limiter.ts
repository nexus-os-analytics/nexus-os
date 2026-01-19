import pLimit from 'p-limit';

/**
 * Sleep for a given number of milliseconds.
 * @param ms milliseconds to sleep
 * @returns
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Bling API: recomenda-se <= 3 requests/segundo.
 * Este limitador garante no máximo 3 concorrentes E no máximo 3 requisições por segundo.
 */
const CONCURRENCY = 3;
const MAX_PER_SECOND = 3;
let timestamps: number[] = [];

export const limit = pLimit(CONCURRENCY);

export async function rateLimited<T>(fn: () => Promise<T>): Promise<T> {
  // Aguarda até que seja possível executar sem ultrapassar o limite de 3 req/s
  while (true) {
    const now = Date.now();
    // Remove timestamps mais antigos que 1 segundo
    const ONE_SECOND_MS = 1000;
    const MIN_WAIT_MS = 100;
    timestamps = timestamps.filter((t) => now - t < ONE_SECOND_MS);
    if (timestamps.length < MAX_PER_SECOND) {
      timestamps.push(now);
      break;
    }
    // Espera o tempo necessário para liberar uma vaga
    const wait = ONE_SECOND_MS - (now - timestamps[0]);
    await sleep(wait > 0 ? wait : MIN_WAIT_MS);
  }
  // Executa com controle de concorrência
  return limit(fn);
}
