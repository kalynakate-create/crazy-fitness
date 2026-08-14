import type { MetadataRoute } from "next";

/** Required by `output: export`, and accurate either way: this never changes
 *  per request. */
export const dynamic = "force-static";

/**
 * Stage 22. Both thank-you pages are excluded here and additionally carry a
 * noindex meta tag, which is the mechanism that actually removes a URL that has
 * already been indexed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://crazyfitness.example";
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/program`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/offer`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
