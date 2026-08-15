import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { ContentGaps } from "@/components/ContentGaps";
import { CookieBanner } from "@/components/sections/CookieBanner";
import { brand } from "@/content/site";
import "./globals.css";

/**
 * Fonts, Stage 12.2 / Stage 21.
 *
 * Cyrillic is a hard requirement, not a nice-to-have, so every family is
 * subset to cyrillic + latin and self-hosted by next/font. That removes the
 * third-party connection to Google entirely, which matters both for the
 * performance budget and for what the privacy policy has to disclose.
 *
 * All three are variable fonts, so weights come from one file per family
 * rather than four static cuts.
 */
const unbounded = Unbounded({
  subsets: ["cyrillic", "latin"],
  variable: "--font-unbounded",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["cyrillic", "latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://crazyfitness.example";

/**
 * Stage 22. The city is [CLIENT DATA REQUIRED], so the title is assembled from
 * what is confirmed instead of shipping a bracket into the search results.
 */
const title = [
  `${brand.name} — ${brand.fullName ?? brand.ownerName}`,
  ["Персональний тренер і нутриціолог", brand.city].filter(Boolean).join(" "),
].join(" | ");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description:
    "Тренування і харчування як одна система, а не два окремі плани. Персонально, у групі або онлайн.",
  openGraph: {
    type: "website",
    locale: "uk_UA",
    siteName: brand.name,
    title,
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0C",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="uk"
      className={`${unbounded.variable} ${manrope.variable} ${jetbrains.variable}`}
    >
      <body>
        {children}
        <CookieBanner />
        <Analytics />
        <ContentGaps />
      </body>
    </html>
  );
}
