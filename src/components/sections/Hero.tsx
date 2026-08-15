"use client";

/**
 * HERO — rebuilt.
 *
 * What the old one got wrong, kept here as the anti-reference:
 *
 *   It was a photograph with type on top, and there is no photograph. What
 *   shipped was a full-bleed grey plate. A hero whose whole composition is
 *   hostage to an asset that has not been shot is not a hero.
 *
 *   Its headline, "Форма, яка залишається", was placeholder text lifted from
 *   the wireframe. A woman arriving mid-scroll from Instagram learned from it
 *   neither who this is nor whether it is for her. It was also long enough
 *   that the display size cropped its last word at every width.
 *
 *   Its action card was a translucent blurred panel: glass used as decoration,
 *   floating over nothing.
 *
 * What this one is:
 *
 *   The claim first, in four words, saying the single thing no other trainer
 *   in this town can say as plainly: the training and the nutrition come from
 *   one person. That is the blueprint's own segment-B differentiator (Opus
 *   Part 3), and it is short enough that no width can crop it.
 *
 *   Then the funnel's first question, answered here. The three chips are the
 *   Stage 9 goal enum, and choosing one carries into the form with step 1
 *   already behind you. The interaction is not ornament: it removes a step.
 *
 *   The chips stand on the measuring rule, each above its own tick. The
 *   signature element stops being a divider and becomes the structure of the
 *   screen: answering is placing yourself on a scale, which is what the whole
 *   brand is about.
 *
 * No photograph is required, now or later. When portraits arrive they belong
 * to the About section, which is the section that is actually about a person.
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { CTA_LABEL, hero } from "@/content/site";
import { track } from "@/lib/analytics";
import { openLeadForm } from "@/lib/cta";
import type { LeadGoal } from "@/lib/types";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function Hero() {
  const root = useRef<HTMLElement>(null);

  /**
   * One authored moment, not an effect per element: the claim lands line by
   * line, the supporting line follows, then the rule draws itself across and
   * the answers rise off it in order. Everything starts from a visible default,
   * so a failed import or a blocked script leaves a complete hero rather than
   * an empty one.
   */
  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: { revert: () => void } | undefined;
    let disposed = false;

    import("gsap").then(({ gsap }) => {
      if (disposed) return;
      ctx = gsap.context(() => {
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .from("[data-hero-line]", {
            yPercent: 108,
            duration: 1.1,
            stagger: 0.07,
          })
          .from("[data-hero-sub]", { opacity: 0, y: 14, duration: 0.8 }, 0.42)
          .from(
            "[data-hero-rule]",
            { scaleX: 0, duration: 1.1, transformOrigin: "left center" },
            0.5,
          )
          .from(
            "[data-hero-entry]",
            { opacity: 0, y: 18, duration: 0.7, stagger: 0.07 },
            0.66,
          )
          .from("[data-hero-tail]", { opacity: 0, duration: 0.6 }, 0.95);
      }, el);
    });

    return () => {
      disposed = true;
      ctx?.revert();
    };
  }, []);

  const choose = (goal: LeadGoal, label: string) => {
    track({ name: "hero_cta_click", params: { cta_label: label, target: "#zapys" } });
    openLeadForm({ sourceSection: "hero", goal });
  };

  return (
    <section
      id="top"
      ref={root}
      aria-label="Crazy Fitness"
      className="shell flex min-h-[100svh] flex-col justify-center pb-[calc(56px+var(--consent-h))] pt-[calc(var(--header-h)+56px)]"
    >
      <h1 className="t-display max-w-[14ch] text-strong">
        {hero.headlineLines.map((line) => (
          <span key={line} className="block overflow-hidden pb-[0.06em]">
            <span data-hero-line className="block">
              {`${line} `}
            </span>
          </span>
        ))}
      </h1>

      <p
        data-hero-sub
        className="t-body-l mt-7 max-w-[40ch] text-body lg:mt-9"
      >
        {hero.sub}
      </p>

      {/* The answers stand on the rule, each claiming its own stretch of it. */}
      <div className="mt-14 lg:mt-20">
        <p className="t-h3 text-strong">{hero.question}</p>

        <div className="relative mt-7">
          <div
            data-hero-rule
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-line"
          />

          <ul className="flex flex-col gap-3 pt-6 md:flex-row md:flex-wrap md:gap-4">
            {hero.entries.map((entry) => (
              <li key={entry.goal} data-hero-entry>
                <button
                  type="button"
                  onClick={() => choose(entry.goal, entry.label)}
                  className="group relative flex w-full items-center justify-between gap-6 rounded-[var(--radius-card)] border border-line px-6 py-4 text-left transition-[border-color,background-color,scale] duration-200 hover:border-orange hover:bg-orange/5 focus-visible:border-orange active:scale-[0.985] md:w-auto md:px-8"
                >
                  {/* The tick this answer stands on: vertical, dropping from
                      the rule to the chip. It grows and takes the accent on
                      hover and on keyboard focus alike.

                      transition names `scale`: Tailwind v4 compiles scale-y-*
                      to the standalone scale property, and naming `transform`
                      would make it snap instead of grow. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-6 left-7 h-6 w-[2px] origin-top scale-y-[0.4] bg-line transition-[scale,background-color] duration-300 ease-[var(--ease-out-strong)] group-hover:scale-y-100 group-hover:bg-orange group-focus-visible:scale-y-100 group-focus-visible:bg-orange md:left-9"
                  />
                  <span className="t-button text-strong">{entry.label}</span>
                  <span
                    aria-hidden="true"
                    className="text-accent-text opacity-0 transition-[translate,opacity] duration-300 ease-[var(--ease-out-strong)] group-hover:translate-x-1 group-hover:opacity-100 group-focus-visible:translate-x-1 group-focus-visible:opacity-100"
                  >
                    →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        data-hero-tail
        className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 lg:mt-16"
      >
        <Button variant="ghost" href={hero.secondary.href}>
          {hero.secondary.label} →
        </Button>
        <button
          type="button"
          onClick={() => {
            track({
              name: "hero_cta_click",
              params: { cta_label: CTA_LABEL, target: "#zapys" },
            });
            openLeadForm({ sourceSection: "hero" });
          }}
          className="t-body text-subtle underline underline-offset-4 transition-colors hover:text-body"
        >
          Ще не знаю, з чого
        </button>
      </div>
    </section>
  );
}
