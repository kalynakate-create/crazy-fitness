"use client";

/**
 * CTA CONTEXT BUS — Stage 28, "CTA-логіка".
 *
 * Every CTA on the site points at the same anchor, but each one carries what
 * the visitor has already told us: which section they came from, and, when
 * they clicked a specific service, which format they picked. Step 2 of the
 * form is then pre-filled rather than asking the same question twice.
 *
 * A module-level store rather than a route change, because Stage 2 rules out
 * routing at the highest-intent moment in the funnel. Ads still get their
 * direct link through `?cta=<section>#zapys`, which seeds the same state on
 * load without costing a navigation.
 */

import type { LeadFormat, LeadGoal, SourceSection } from "./types";

export type CtaContext = {
  sourceSection: SourceSection;
  format?: LeadFormat;
  goal?: LeadGoal;
};

const SECTIONS: SourceSection[] = [
  "hero",
  "services",
  "product",
  "faq",
  "sticky-bar",
  "club",
];

let current: CtaContext = { sourceSection: "hero" };
const listeners = new Set<(value: CtaContext) => void>();

export function getCtaContext(): CtaContext {
  return current;
}

export function subscribeCta(fn: (value: CtaContext) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function publish(next: CtaContext) {
  current = next;
  for (const fn of listeners) fn(next);
}

/** Seeds context from `?cta=` so paid traffic keeps its attribution. */
export function seedCtaFromUrl(): void {
  if (typeof window === "undefined") return;
  const value = new URLSearchParams(window.location.search).get("cta");
  if (value && (SECTIONS as string[]).includes(value)) {
    publish({ sourceSection: value as SourceSection });
  }
}

/** Records the context and moves the page to the form. */
export function openLeadForm(context: CtaContext): void {
  publish(context);
  const target = document.getElementById("zapys");
  if (!target) return;

  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
}

export function readUtm() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
  };
}
