/**
 * Worker entry point.
 *
 * The adapter generates .open-next/worker.js, which is what wrangler used to
 * run directly. It is still the whole application; this file only widens the
 * set of exports so a Durable Object of our own can sit alongside the ones the
 * adapter defines for its cache and queue.
 *
 * `export *` rather than naming the adapter's classes: that list is an
 * implementation detail of @opennextjs/cloudflare and changes between versions.
 * Naming them here would turn a routine upgrade into a deploy that fails with
 * a missing-class error, at a moment when nobody is looking for one.
 *
 * Plain JavaScript, not TypeScript, on purpose. The import target does not
 * exist until `opennextjs-cloudflare build` has run, so a .ts file here would
 * make `npm run typecheck` fail on a clean checkout. wrangler bundles this and
 * resolves the .ts import below on its own.
 */

export * from "./.open-next/worker.js";
export { default } from "./.open-next/worker.js";

export { RateLimiter } from "./src/lib/rate-limiter-do.ts";
