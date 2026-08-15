/**
 * Durable Object backing the spam limiter.
 *
 * WHY THIS EXISTS RATHER THAN THE SIMPLER OPTION
 *
 * Two cheaper approaches were tried against the real deployment and measured,
 * not assumed. Both failed:
 *
 * 1. A module-level Map. Cloudflare spreads requests across isolates and each
 *    one reads its own empty Map. Forty requests from one address produced zero
 *    refusals — the limiter was not weak, it was absent.
 *
 * 2. Cloudflare's built-in rate limiting binding. It is reachable and it does
 *    refuse some traffic, but it is approximate by design. Measured at a
 *    ceiling of three per minute, eleven of twelve spaced requests still got
 *    through, and it resumed accepting after a refusal. That is probabilistic
 *    throttling, not a ceiling, and describing it as protection would overstate
 *    what it does. It also caps its window at sixty seconds.
 *
 * A Durable Object is the cheapest thing that actually counts. Each address
 * gets its own instance, so the count is exact and the window can be a real
 * hour again, which is what the two-bucket design needed in the first place.
 *
 * The object deletes its own storage once a window has elapsed with no traffic,
 * so idle addresses cost nothing to keep around.
 */

/** Minimal shapes for the Workers runtime, declared locally so the project
 *  does not take on @cloudflare/workers-types for two interfaces. */
interface DurableObjectStorage {
  get<T>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
  deleteAll(): Promise<void>;
  setAlarm(scheduledTime: number): Promise<void>;
}

interface DurableObjectState {
  storage: DurableObjectStorage;
  blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>;
}

export interface LimitRequest {
  limit: number;
  windowMs: number;
}

export class RateLimiter {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const { limit, windowMs } = (await request.json()) as LimitRequest;

    // blockConcurrencyWhile makes the read-modify-write atomic. Without it two
    // overlapping requests can both read the same count before either writes,
    // which is exactly the race that made the built-in limiter leak.
    const limited = await this.state.blockConcurrencyWhile(async () => {
      const now = Date.now();
      const stored = (await this.state.storage.get<number[]>("hits")) ?? [];

      const recent = stored.filter((t) => now - t < windowMs);
      recent.push(now);

      await this.state.storage.put("hits", recent);
      // Self-cleanup: if nothing arrives for a full window, drop everything.
      await this.state.storage.setAlarm(now + windowMs);

      return recent.length > limit;
    });

    return new Response(JSON.stringify({ limited }), {
      headers: { "content-type": "application/json" },
    });
  }

  async alarm(): Promise<void> {
    await this.state.storage.deleteAll();
  }
}
