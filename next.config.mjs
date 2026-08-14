/**
 * Two build modes.
 *
 * Default is the real one: a Next.js server on Vercel, with working API routes.
 * That is what Stage 18 chose and what the site needs to actually take a lead
 * or a payment.
 *
 * `STATIC_EXPORT=1` produces a flat folder for GitHub Pages. Pages serves files
 * and nothing else, so `/api/lead` and `/api/order` cannot exist there. That
 * build is a design preview for showing the client, not a deployment of the
 * product — it is paired with NEXT_PUBLIC_STATIC_DEMO so the forms say so
 * plainly instead of failing at the submit button.
 */

const isStatic = process.env.STATIC_EXPORT === "1";

/** Project Pages sites live under /<repo>, so assets need the prefix. */
const basePath = process.env.PAGES_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Stage 21: AVIF/WebP are non-negotiable, hero photo budget is 250KB.
    formats: ["image/avif", "image/webp"],
    // No optimiser exists on Pages, so images ship as authored there.
    ...(isStatic ? { unoptimized: true } : {}),
  },

  ...(isStatic
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath || undefined,
        // Pages resolves /about to /about/index.html.
        trailingSlash: true,
      }
    : {
        async headers() {
          return [
            {
              // Stage 21: the Instagram in-app WebView caches HTML aggressively
              // on back-navigation. Revalidate documents so returning users do
              // not get a stale page. Not supported under `output: export`,
              // which is one more reason Pages is only ever the preview.
              source: "/:path*",
              headers: [
                { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
