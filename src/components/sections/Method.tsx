"use client";

/**
 * 04 METHOD — Stage 3 / Stage 15.
 *
 * The horizontal scroll-pin from the original plan is gone. Opus already
 * hedged on it, scroll-jacking is a reliable source of jank and accessibility
 * complaints, and there is no separate QA cycle here to catch that. This is the
 * same vertical timeline on every breakpoint: wider container and a two-column
 * step on desktop, stacked on mobile.
 *
 * The numbering earns its place. These steps are an actual sequence, so the
 * order carries information the reader needs. Numbers on a set of unordered
 * features would be decoration; here they are not.
 *
 * ScrollTrigger drives one thing, the progress line, because tying a fill to
 * scroll position is exactly what it is good at. Everything else on the page
 * uses IntersectionObserver.
 */

import { useEffect, useRef } from "react";
import { Figure } from "@/components/ui/Figure";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { method } from "@/content/site";

export function Method() {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!track || !fill) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fill.style.transform = "scaleY(1)";
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);

        const tween = gsap.fromTo(
          fill,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: track,
              start: "top 70%",
              end: "bottom 60%",
              scrub: 0.4,
            },
          },
        );

        cleanup = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      },
    );

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <section id="metod" aria-labelledby="metod-h" className="section shell">
      <SectionHeader
        eyebrow={method.eyebrow}
        heading={method.heading}
        headingId="metod-h"
      />

      <div ref={trackRef} className="relative mt-16 pl-10 lg:mt-24 lg:pl-16">
        {/* The axis, and the orange fill that measures how far you have read. */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-[7px] top-2 w-px bg-steel lg:left-[11px]"
        >
          <div
            ref={fillRef}
            className="h-full w-full origin-top bg-orange"
            style={{ transform: "scaleY(0)" }}
          />
        </div>

        <ol className="grid gap-16 lg:gap-24">
          {method.steps.map((step, index) => (
            <Reveal as="li" key={step.title} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-10 top-1 size-[15px] rounded-full border-2 border-orange bg-ink lg:-left-16 lg:size-[23px]"
              />
              <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-14">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[13px] tracking-[0.12em] text-orange">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="t-h3 mt-4 text-white">{step.title}</h3>
                  <p className="t-body mt-4 max-w-[52ch] text-muted">{step.body}</p>
                </div>

                <Figure
                  src={step.photo}
                  ratio="4 / 3"
                  sizes="(min-width: 1200px) 320px, 100vw"
                  alt={`Крок ${index + 1}: ${step.title}`}
                  placeholderNote="Фото процесу"
                  className="rounded-[var(--radius-card)]"
                />
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
