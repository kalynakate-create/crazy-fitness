"use client";

/**
 * COOKIE / ANALYTICS CONSENT — Stage 9.
 *
 * GA4 and Meta Pixel only initialise after an explicit accept. Declining is a
 * real, remembered choice, not a banner that reappears until you give in.
 */

const KEY = "cf-consent-v1";

export type ConsentState = "granted" | "denied" | "unset";

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return "unset";
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : "unset";
  } catch {
    return "unset";
  }
}

export function writeConsent(state: Exclude<ConsentState, "unset">): void {
  try {
    window.localStorage.setItem(KEY, state);
  } catch {
    /* Private mode or blocked storage: consent simply stays unset. */
  }
  window.dispatchEvent(new CustomEvent("cf-consent-change", { detail: state }));
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === "granted";
}
