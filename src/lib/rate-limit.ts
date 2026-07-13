/**
 * Rate limiting simples por janela deslizante em memoria.
 * Suficiente para dev/MVP single-instance. Para producao multi-instancia,
 * trocar por Upstash Redis (mesma assinatura de funcao).
 */

const WINDOW_MS = 60_000; // 1 minuto
const MAX_ATTEMPTS = 5;

const hits = new Map<string, number[]>();

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

/**
 * Retorna true se a acao e permitida, false se estourou o limite.
 */
export async function checkRateLimit(
  key: string,
  opts: RateLimitOptions = {},
): Promise<boolean> {
  const windowMs = opts.windowMs ?? WINDOW_MS;
  const max = opts.max ?? MAX_ATTEMPTS;
  const now = Date.now();

  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  hits.set(key, timestamps);

  return timestamps.length <= max;
}

/** Util para testes: limpa o estado. */
export function _resetRateLimit(): void {
  hits.clear();
}
