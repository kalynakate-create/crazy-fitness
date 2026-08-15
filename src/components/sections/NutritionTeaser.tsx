"use client";

/**
 * 07 NUTRITION TEASER — Opus 6.2 §07 / Stage 7.
 *
 * The one inverted band on the page. It marks the digital product as a
 * different kind of thing from the coaching above it, and the switch of ground
 * does that work without a badge or a ribbon.
 *
 * It used to be the single light section on a dark page; now it is the single
 * dark section on a light one. Same job, same single use, opposite polarity.
 *
 * The whole card is the link, not just the button: on a phone a large target
 * beats a precise one.
 */

import Link from "next/link";
import { Figure } from "@/components/ui/Figure";
import { Reveal } from "@/components/ui/Reveal";
import { product } from "@/content/site";
import { track } from "@/lib/analytics";
import { priceLabel } from "@/lib/format";

export function NutritionTeaser() {
  const price = priceLabel(product.priceAmount, "");

  return (
    <section
      id="programa"
      aria-labelledby="programa-h"
      className="section bg-invert text-invert-body"
    >
      <div className="shell">
        <Reveal>
          <Link
            href="/program"
            onClick={() =>
              track({ name: "product_cta_click", params: { source_section: "product" } })
            }
            className="group grid gap-10 md:grid-cols-[280px_1fr] md:items-center md:gap-16 lg:grid-cols-[360px_1fr]"
          >
            <div className="transition-transform duration-500 ease-[var(--ease-out-strong)] motion-safe:group-hover:-rotate-1 motion-safe:group-hover:scale-[1.02]">
              <Figure
                src={product.mockup}
                ratio="4 / 5"
                sizes="(min-width: 1200px) 360px, 100vw"
                alt={product.name}
                placeholderNote="Мокап програми"
                className="rounded-[var(--radius-card)]"
              />
            </div>

            <div>
              <p className="t-eyebrow text-invert-subtle">{product.eyebrow}</p>
              <h2 id="programa-h" className="t-h2 mt-5 text-invert-body">
                {product.name}
              </h2>

              <ul className="mt-8 grid gap-3">
                {product.benefits.map((benefit) => (
                  <li key={benefit} className="t-body flex gap-4 text-invert-body/85">
                    <span aria-hidden="true" className="mt-2.5 h-px w-5 shrink-0 bg-orange" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                {/* Not orange: on the softened band it measures 2.7:1, which
                    fails outright. Orange survives here only as the graphic
                    dashes, which are not text. */}
                <span className="font-[family-name:var(--font-mono)] text-[15px] text-invert-body">
                  {price}
                </span>
                <span className="t-button relative inline-flex items-center gap-2 text-invert-body">
                  Детальніше про програму
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                  <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-orange transition-transform duration-300 group-hover:scale-x-100" />
                </span>
              </div>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
