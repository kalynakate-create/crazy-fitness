/**
 * SPAM PROTECTION — Stage 9.
 *
 * Deliberately invisible. No captcha at launch: a visible challenge adds
 * friction to the highest-intent moment in the funnel to solve a problem the
 * site does not have yet. Turnstile/hCaptcha gets added only if real spam
 * shows up after launch.
 *
 * Two buckets, not one, and the split matters here specifically.
 *
 * Most of this traffic is mobile, from Instagram, on Ukrainian carriers that
 * put many subscribers behind one address (CGNAT). A single counter that also
 * ticked on rejected submissions would mean several mistyped phone numbers,
 * from several different women sharing a carrier IP, lock the next one out.
 * The people most likely to fumble the form are exactly the ones we would be
 * turning away.
 *
 * So: a loose `request` ceiling catches hammering, and a tight `submit`
 * ceiling is only charged once a submission is actually well-formed. Garbage
 * costs an attacker requests but never consumes a real person's quota.
 *
 *
 * WHY THIS IS NOT AN IN-MEMORY COUNTER ANY MORE
 *
 * It used to be a module-level Map with hour-long windows, carrying a comment
 * that a burst spread across cold starts could exceed the limit. Measured
 * against the deployed Worker, that understated it: 40 requests from one
 * address produced zero refusals. Cloudflare spreads requests across isolates,
 * and each isolate reads its own empty Map, so the limiter was not weak — it
 * was absent, and had been silently absent for every request in production.
 *
 * Cloudflare's built-in rate limiting binding was tried next and also measured.
 * It is reachable and refuses some traffic, but it is approximate by design: at
 * a ceiling of three per minute, eleven of twelve spaced requests still got
 * through. It also caps its window at sixty seconds.
 *
 * So the counting happens in a Durable Object, one per address, which counts
 * exactly and restores the hour window this design was built around. See
 * rate-limiter-do.ts.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

const HOUR = 60 * 60 * 1000;
const MIN_FILL_MS = 2000;

const BUCKETS = {
  /** Any request that clears the honeypot. Flood guard, deliberately loose. */
  request: { limit: 30, windowMs: HOUR },
  /** Charged only for well-formed submissions. This is the real limit. */
  submit: { limit: 5, windowMs: HOUR },
} as const;

export type Bucket = keyof typeof BUCKETS;

/** Minimal shape of the Durable Object namespace binding. */
interface DurableObjectStub {
  fetch(input: string, init?: RequestInit): Promise<Response>;
}

interface RateLimiterNamespace {
  idFromName(name: string): unknown;
  get(id: unknown): DurableObjectStub;
}

/**
 * Warn once per isolate when the edge limiter is not reachable.
 *
 * Silence is what made the previous limiter dangerous: it refused nothing for
 * every request in production and said nothing about it. A fallback to the
 * in-memory counter on Workers means the same thing is happening again, so it
 * has to be visible in the logs rather than inferred from a probe.
 */
let warnedMissing = false;

function limiterNamespace(): RateLimiterNamespace | null {
  try {
    const env = getCloudflareContext().env as unknown as
      | { RATE_LIMITER?: RateLimiterNamespace }
      | undefined;
    const binding = env?.RATE_LIMITER;

    if (!binding && !warnedMissing) {
      warnedMissing = true;
      console.warn("[rate-limit] RATE_LIMITER absent; counting in memory");
    }

    return binding ?? null;
  } catch (err) {
    // Off Workers this is normal: `next dev`, `next start`, any other host.
    if (!warnedMissing) {
      warnedMissing = true;
      console.warn(`[rate-limit] no Cloudflare context (${String(err)})`);
    }
    return null;
  }
}

/**
 * The client's address.
 *
 * `CF-Connecting-IP` is set by Cloudflare itself and a request cannot forge
 * it. `X-Forwarded-For` can be forged: anyone may send whatever they like in
 * that header, so trusting it first meant an attacker defeated every per-address
 * limit by rotating one string. It stays only as the fallback for hosts that
 * are not behind Cloudflare, where a trusted proxy sets it.
 */
export function clientIp(req: Request): string {
  const connecting = req.headers.get("cf-connecting-ip");
  if (connecting) return connecting.trim();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();

  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Fallback counter for when there is no binding: local development, and any
 * non-Cloudflare host. Same window and same ceilings as the edge, so that
 * behaviour observed locally is behaviour that holds in production — the
 * divergence between the two is what hid the missing limiter for so long.
 */
const hits = new Map<string, number[]>();

function memoryLimited(ip: string, bucket: Bucket): boolean {
  const { limit, windowMs } = BUCKETS[bucket];
  const key = `${bucket}:${ip}`;
  const now = Date.now();

  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= HOUR)) hits.delete(k);
    }
  }

  return recent.length > limit;
}

export async function isRateLimited(ip: string, bucket: Bucket): Promise<boolean> {
  const namespace = limiterNamespace();

  if (namespace) {
    const { limit, windowMs } = BUCKETS[bucket];
    try {
      // One object per bucket and address, so counts never contend with
      // unrelated traffic. The URL is required by the stub but ignored.
      const stub = namespace.get(namespace.idFromName(`${bucket}:${ip}`));
      const res = await stub.fetch("https://rate-limiter/check", {
        method: "POST",
        body: JSON.stringify({ limit, windowMs }),
      });
      const { limited } = (await res.json()) as { limited: boolean };
      return limited;
    } catch (err) {
      // Reachable but failing: fall through rather than refuse everyone.
      console.warn(`[rate-limit] durable object failed (${String(err)})`);
    }
  }

  return memoryLimited(ip, bucket);
}

/** Honeypot field: hidden from humans, irresistible to bots. */
export function trippedHoneypot(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * A form completed faster than a human could read it.
 *
 * Takes an elapsed duration measured on the client, not a client timestamp
 * compared against server time. The original compared the two clocks, which
 * only works when they agree: a visitor whose phone clock is a few minutes off
 * would either have every submission silently swallowed as "too fast", or slip
 * past the check entirely. Both are worse than no check, and the first loses
 * real leads without a trace. Measuring start and end on the same clock makes
 * skew cancel out.
 *
 * A bot can forge this number, but it could forge the timestamp equally well.
 * This was always a weak signal; now it is a weak signal that cannot hurt a
 * real person.
 */
export function submittedTooFast(elapsedMs: number | undefined): boolean {
  if (typeof elapsedMs !== "number" || !Number.isFinite(elapsedMs)) return false;
  return elapsedMs >= 0 && elapsedMs < MIN_FILL_MS;
}
