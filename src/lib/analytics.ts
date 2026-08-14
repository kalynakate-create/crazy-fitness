"use client";

/**
 * ANALYTICS — Stage 23.
 *
 * Only events that can change a decision. Generic scroll depth and per-hover
 * clicks are deliberately absent: noise nobody would act on.
 *
 * Nothing fires before consent (Stage 9). Events raised earlier are dropped,
 * not queued, so we never backfill a session the visitor did not agree to.
 */

import { hasAnalyticsConsent } from "./consent";

export type AnalyticsEvent =
  | { name: "hero_cta_click"; params: { cta_label: string; target: string } }
  /** Measures the Opus Part 2.4 KPI "scroll depth to Results > 40%". */
  | { name: "results_section_view"; params?: never }
  | { name: "consultation_open"; params: { source_section: string } }
  | { name: "consultation_step_complete"; params: { step: 1 | 2 | 3 } }
  | { name: "consultation_submit"; params: { goal: string; format: string } }
  | { name: "consultation_telegram_fallback_click"; params?: never }
  | { name: "product_view"; params?: never }
  | { name: "product_cta_click"; params: { source_section: string } }
  | { name: "checkout_start"; params?: never }
  | {
      name: "purchase_complete";
      params: { value: number; currency: string; product_id: string };
    }
  | { name: "telegram_click"; params: { source_section: string } }
  | { name: "instagram_click"; params: { source_section: string } }
  | { name: "faq_item_open"; params: { question_id: string } };

/** Conversion events are mirrored into Meta Pixel under its own names. */
const META_MIRROR: Partial<Record<AnalyticsEvent["name"], string>> = {
  consultation_submit: "Lead",
  purchase_complete: "Purchase",
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  const params = ("params" in event ? event.params : undefined) ?? {};

  window.gtag?.("event", event.name, params);

  const metaName = META_MIRROR[event.name];
  if (metaName) window.fbq?.("track", metaName, params);

  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", event.name, params);
  }
}
