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
 *
 * It hides over the other lead-form buttons for the same reason, which it did
 * not do at first. Measured at 375px, the bar began at y=727 while the
 * "Записатися на консультацію" button occupied 693–745: the bar covered its
 * lower 18px and the two identical orange buttons sat a pixel apart, reading
 * as one broken shape. It happened at exactly the moment someone had decided
 * to press.
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
    if (!hero) return;

    let heroGone = false;
    // Anything on screen that already offers the same action. Kept as a set
    // rather than a counter so a repeated observer callback cannot leave the
    // bar stuck hidden.
    const covered = new Set<Element>();
    const sync = () => setVisible(heroGone && covered.size === 0);

    const heroWatch = new IntersectionObserver(
      ([entry]) => {
        heroGone = !entry!.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    heroWatch.observe(hero);

    const track = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) covered.add(entry.target);
        else covered.delete(entry.target);
      }
      sync();
    };

    // Two thresholds on purpose. The form counts only once it is meaningfully
    // on screen, which is the original behaviour and worth keeping: a sliver of
    // a 458px section arriving is not yet a reason to drop the bar. A button
    // counts the moment any part of it appears, because even a sliver is
    // something the bar can sit on top of.
    const formWatch = new IntersectionObserver(track, { threshold: 0.15 });
    const ctaWatch = new IntersectionObserver(track, { threshold: 0 });

    const form = document.getElementById("zapys");
    if (form) formWatch.observe(form);
    for (const cta of document.querySelectorAll("[data-primary-cta]")) {
      ctaWatch.observe(cta);
    }

    return () => {
      heroWatch.disconnect();
      formWatch.disconnect();
      ctaWatch.disconnect();
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-page/95 p-4 backdrop-blur transition-transform duration-300 ease-[var(--ease-out-strong)] lg:hidden ${
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
