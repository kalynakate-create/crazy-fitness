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
 * ticked on rejected submissions would mean five mistyped phone numbers, from
 * five different women sharing a carrier IP, locks the sixth out for an hour.
 * The people most likely to fumble the form are exactly the ones we would be
 * turning away.
 *
 * So: a generous `request` ceiling catches hammering, and a tight `submit`
 * ceiling is only charged once a submission is actually well-formed. Garbage
 * costs an attacker requests but never consumes a real person's quota.
 *
 * Caveat worth knowing: these counters live in the memory of one serverless
 * instance, so a burst spread across cold starts can exceed the limit. They
 * raise the cost of scripted abuse rather than eliminating it, which is the
 * right trade at this traffic level. Move to durable storage if abuse becomes
 * real.
 */

const HOUR = 60 * 60 * 1000;
const MIN_FILL_MS = 2000;

const BUCKETS = {
  /** Any request that clears the honeypot. Flood guard, deliberately loose. */
  request: { limit: 30, windowMs: HOUR },
  /** Charged only for well-formed submissions. This is the real limit. */
  submit: { limit: 5, windowMs: HOUR },
} as const;

export type Bucket = keyof typeof BUCKETS;

const hits = new Map<string, number[]>();

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function isRateLimited(ip: string, bucket: Bucket): boolean {
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
