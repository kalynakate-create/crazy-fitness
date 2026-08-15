import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Adapter config for running this Next.js app on Cloudflare Workers.
 *
 * Deliberately minimal: no incremental cache, no queue, no tag store. This site
 * has no ISR and no on-demand revalidation to support — the pages are static
 * and the two dynamic routes are POST endpoints that talk to Sheets, Telegram
 * and Monobank. Adding cache infrastructure here would be provisioning R2 and
 * KV for traffic patterns that do not exist.
 */
export default defineCloudflareConfig();
