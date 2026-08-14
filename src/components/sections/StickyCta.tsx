"use client";

/**
 * MOBILE STICKY CTA — Stage 4 / Stage 16.
 *
 * The desktop action card does not get restated as a block on mobile; it folds
 * into this bar, which appears the moment the hero leaves the screen and stays
 * for the rest of the page. Same job, native mobile form.
 *
 * It hides itself over the form: a floating "Записатися" on top of the very
 * form it opens is noise, and it would cover the submit button on short
 * screens.
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CTA_LABEL } from "@/content/site";
import { track } from "@/lib/analytics";
import { openLeadForm } from "@/lib/cta";

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const form = document.getElementById("zapys");
    if (!hero) return;

    let heroGone = false;
    let onForm = false;
    const sync = () => setVisible(heroGone && !onForm);

    const heroWatch = new IntersectionObserver(
      ([entry]) => {
        heroGone = !entry!.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    heroWatch.observe(hero);

    let formWatch: IntersectionObserver | undefined;
    if (form) {
      formWatch = new IntersectionObserver(
        ([entry]) => {
          onForm = entry!.isIntersecting;
          sync();
        },
        { threshold: 0.15 },
      );
      formWatch.observe(form);
    }

    return () => {
      heroWatch.disconnect();
      formWatch?.disconnect();
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-steel bg-ink/95 p-4 backdrop-blur transition-transform duration-300 ease-[var(--ease-out-strong)] lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      // Hidden from assistive tech while off screen so it is not a phantom stop.
      aria-hidden={!visible}
      style={{
        bottom: "var(--consent-h)",
        paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
      }}
    >
      <Button
        fullWidth
        tabIndex={visible ? undefined : -1}
        onClick={() => {
          track({
            name: "hero_cta_click",
            params: { cta_label: CTA_LABEL, target: "sticky-bar" },
          });
          openLeadForm({ sourceSection: "sticky-bar" });
        }}
      >
        {CTA_LABEL}
      </Button>
    </div>
  );
}
