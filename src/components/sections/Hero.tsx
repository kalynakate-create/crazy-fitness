"use client";

/**
 * HERO — Concept A "MANIFEST", Stage 4.
 *
 * Full-bleed portrait, headline pinned to the lower left, and the action card
 * borrowed from Concept C floating right of centre: a format, a duration and a
 * price beat an empty "Записатися" button, because specifics convert.
 *
 * Concept B stays documented in the blueprint as a fallback and is not built
 * here; if the photo audit sends us there, this is the only file that changes.
 *
 * The card carries a shadow, which is the one documented exception to the
 * no-shadow rule (Stage 4): it floats above a photograph, not above a section,
 * so the elevation is describing something real.
 *
 * Mobile is composed separately rather than squeezed: one full-width button, a
 * text link under it, and the action card folded into the sticky bar that
 * appears once the hero leaves the screen.
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Figure } from "@/components/ui/Figure";
import { ScaleIndicator } from "@/components/ui/ScaleDivider";
import { CTA_LABEL, hero } from "@/content/site";
import { track } from "@/lib/analytics";
import { openLeadForm } from "@/lib/cta";
import { priceLabel } from "@/lib/format";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: { revert: () => void } | undefined;
    let disposed = false;

    import("gsap").then(({ gsap }) => {
      if (disposed) return;
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(
          "[data-hero-photo]",
          { opacity: 0, scale: 1.06 },
          { opacity: 1, scale: 1, duration: 1.2 },
        )
          .fromTo(
            "[data-hero-line]",
            { yPercent: 110 },
            { yPercent: 0, duration: 0.9, stagger: 0.08 },
            0.15,
          )
          .fromTo(
            "[data-hero-fade]",
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 },
            0.7,
          );
      }, el);
    });

    return () => {
      disposed = true;
      ctx?.revert();
    };
  }, []);

  /* Light parallax without ScrollTrigger: one passive listener, one transform,
     read and write batched into a frame. Stage 21's budget matters more here
     than the convenience of a plugin. */
  useEffect(() => {
    const node = photoRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const shift = Math.min(window.scrollY, window.innerHeight) * 0.12;
        node.style.transform = `translate3d(0, ${shift}px, 0)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const goToForm = (label: string) => {
    track({ name: "hero_cta_click", params: { cta_label: label, target: "#zapys" } });
    openLeadForm({ sourceSection: "hero" });
  };

  const cardPrice = priceLabel(hero.actionCard.priceFromAmount);

  return (
    <section
      id="top"
      ref={root}
      aria-label="Crazy Fitness"
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      <div ref={photoRef} className="absolute inset-0 will-change-transform">
        <div data-hero-photo className="absolute inset-0">
          <Figure
            src={hero.photo}
            ratio="fill"
            priority
            sizes="100vw"
            alt="Анастасія, тренер і нутриціолог Crazy Fitness"
            placeholderNote="Hero: вертикальний портрет 9:16, погляд у камеру"
          />
        </div>
      </div>

      {/* Scrim: the headline needs a guaranteed contrast floor over any photo. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-ink/80 via-transparent to-transparent"
      />

      {/* Bottom padding grows by the consent banner's height on mobile, so the
          CTA is never sitting underneath it on a first visit. */}
      <div className="shell relative z-10 flex flex-1 flex-col justify-end pb-[calc(48px+var(--consent-h))] pt-[calc(var(--header-h)+32px)] lg:pb-16">
        <div className="grid-site items-end">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <h1 className="t-display text-white">
              {hero.headlineLines.map((line) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  {/* Trailing space keeps the accessible name readable: the
                      lines are block-level, so it costs nothing visually but
                      stops screen readers running the words together. */}
                  <span data-hero-line className="block">
                    {`${line} `}
                  </span>
                </span>
              ))}
            </h1>

            <p data-hero-fade className="t-body-l mt-7 max-w-[38ch] text-chalk/85">
              {hero.sub}
            </p>

            <div data-hero-fade className="mt-9 lg:hidden">
              <Button fullWidth onClick={() => goToForm(CTA_LABEL)}>
                {CTA_LABEL}
              </Button>
              <div className="mt-5">
                <Button variant="ghost" href={hero.secondary.href}>
                  {hero.secondary.label} →
                </Button>
              </div>
            </div>

            <div data-hero-fade className="mt-10 hidden lg:block">
              <Button variant="ghost" href={hero.secondary.href}>
                {hero.secondary.label} →
              </Button>
            </div>
          </div>

          <div
            data-hero-fade
            className="hidden lg:col-span-4 lg:col-start-9 lg:block"
          >
            <div className="rounded-[var(--radius-card)] border border-white/10 bg-surface/60 p-8 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)] backdrop-blur-md">
              <p className="t-eyebrow">{hero.actionCard.title}</p>
              <p className="mt-4 font-[family-name:var(--font-mono)] text-[15px] text-chalk">
                {hero.actionCard.durationMin} хв
                <span className="mx-2 text-muted">·</span>
                <span className={cardPrice.startsWith("від") ? "" : "text-muted"}>
                  {cardPrice}
                </span>
              </p>
              <div className="mt-7">
                <Button fullWidth onClick={() => goToForm(hero.actionCard.cta)}>
                  {hero.actionCard.cta} →
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div data-hero-fade className="mt-14 hidden lg:block">
          <ScaleIndicator />
        </div>
      </div>
    </section>
  );
}
