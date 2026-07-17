/**
 * Limiteur de tentatives, en mémoire du processus.
 *
 * Suffisant pour ce déploiement (un conteneur applicatif unique).
 */
type Attempt = { count: number; firstAt: number; blockedUntil?: number };

const attempts = new Map<string, Attempt>();

const WINDOW_MS = 15 * 60 * 1000; // fenêtre d'observation
const MAX_ATTEMPTS = 8; // échecs tolérés dans la fenêtre
const BLOCK_MS = 15 * 60 * 1000; // durée de blocage

/** Purge opportuniste pour éviter que la Map ne grossisse indéfiniment. */
function sweep(now: number) {
  if (attempts.size < 1000) return;
  for (const [key, a] of attempts) {
    if (now - a.firstAt > WINDOW_MS && (a.blockedUntil ?? 0) < now) {
      attempts.delete(key);
    }
  }
}

/** Nombre de secondes restantes avant de pouvoir réessayer, ou 0 si autorisé. */
export function retryAfterSeconds(key: string): number {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a?.blockedUntil) return 0;
  if (a.blockedUntil <= now) return 0;
  return Math.ceil((a.blockedUntil - now) / 1000);
}

/** À appeler après un échec d'authentification. */
export function recordFailure(key: string): void {
  const now = Date.now();
  sweep(now);

  const a = attempts.get(key);
  if (!a || now - a.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now });
    return;
  }

  a.count += 1;
  if (a.count >= MAX_ATTEMPTS) {
    a.blockedUntil = now + BLOCK_MS;
  }
}

/** À appeler après une authentification réussie. */
export function recordSuccess(key: string): void {
  attempts.delete(key);
}
