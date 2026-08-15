"use client";

/**
 * 10 INSTAGRAM — moved here from between FAQ and the form, Stage 3.
 *
 * In its original position it was an exit door at the exact moment of highest
 * intent: tap through to an app built on infinite scroll and you do not come
 * back. Sitting right after the reviews it is thematically at home (both are
 * social proof) and, more importantly, there is now no way off the page between
 * the FAQ and the form.
 */

import { Figure } from "@/components/ui/Figure";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { brand, instagram } from "@/content/site";
import { track } from "@/lib/analytics";

export function Instagram() {
  const tiles = instagram.posts.length
    ? instagram.posts
    : (Array.from({ length: 6 }, () => null) as (string | null)[]);

  return (
    <section
      id="instagram"
      aria-labelledby="instagram-h"
      // Same scrollbar-width guard as the club gallery. See Club.tsx.
      className="section overflow-x-clip bg-graphite"
    >
      <div className="shell">
        <Reveal>
          <p className="t-eyebrow">{instagram.eyebrow}</p>
          <h2 id="instagram-h" className="t-h2 mt-5 text-white">
            {instagram.heading}
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:mt-16 lg:grid-cols-6 lg:gap-5">
          {tiles.map((src, index) => (
            <Reveal key={index} delay={index * 50}>
              <Figure
                src={src}
                ratio="1 / 1"
                sizes="(min-width: 1200px) 16vw, 45vw"
                alt="Допис в Instagram"
                placeholderNote={index === 0 ? "Кадри без рамок" : undefined}
              />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <Button
            variant="secondary"
            href={brand.instagramUrl}
            onClick={() =>
              track({ name: "instagram_click", params: { source_section: "product" } })
            }
          >
            {instagram.cta}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
