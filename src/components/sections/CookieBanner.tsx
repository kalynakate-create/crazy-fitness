"use client";

/**
 * COOKIE / ANALYTICS CONSENT — Stage 9.
 *
 * GA4 and Meta Pixel both run on this site, so a banner is not optional. It is
 * light: one sentence, accept, decline, and a link to the policy. Declining is
 * a real answer that is remembered, not a dark pattern that asks again on the
 * next page.
 *
 * ⚠ The exact wording and whether analytics may default to on before an
 * explicit accept is a question for the lawyer reviewing /privacy (Stage 24).
 * The implementation here takes the strict reading: nothing fires until accept.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { readConsent, writeConsent } from "@/lib/consent";

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Deferred a beat so it never competes with the hero for first paint.
    const timer = window.setTimeout(() => setOpen(readConsent() === "unset"), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  /**
   * On a 375x812 phone this banner covers the bottom of the hero, which is
   * exactly where the primary CTA lives. Every first-time visitor would arrive
   * to a covered button, on the channel that carries most of the traffic.
   *
   * So it publishes its own height and the hero and sticky bar reserve that
   * space, instead of the banner being allowed to sit on top of the one thing
   * the page is for.
   */
  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;

    if (!open || !el) {
      root.style.setProperty("--consent-h", "0px");
      return;
    }

    const measure = () =>
      root.style.setProperty("--consent-h", `${el.offsetHeight}px`);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);

    return () => {
      observer.disconnect();
      root.style.setProperty("--consent-h", "0px");
    };
  }, [open]);

  if (!open) return null;

  const decide = (value: "granted" | "denied") => {
    writeConsent(value);
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Згода на аналітику"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-steel bg-surface p-5 lg:bottom-6 lg:left-6 lg:right-auto lg:max-w-[420px] lg:rounded-[var(--radius-card)] lg:border"
      style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
    >
      <p className="t-body text-chalk">
        Використовуємо аналітику, щоб покращувати сайт.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => decide("granted")}
          className="t-button min-h-[44px] rounded-[var(--radius-card)] bg-orange px-6 text-ink transition-colors hover:bg-orange-hover"
        >
          Прийняти
        </button>
        <button
          type="button"
          onClick={() => decide("denied")}
          className="t-button min-h-[44px] rounded-[var(--radius-card)] border border-steel px-6 text-chalk transition-colors hover:border-muted"
        >
          Відхилити
        </button>
        <Link
          href="/privacy"
          className="t-body text-muted underline underline-offset-4 hover:text-chalk"
        >
          Детальніше
        </Link>
      </div>
    </div>
  );
}
