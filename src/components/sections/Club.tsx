"use client";

/**
 * 08 CLUB ATMOSPHERE — Stage 3.
 *
 * Native scroll-snap, no JS pin and no Draggable. Touch users get the gesture
 * they already know, and the section costs nothing to run.
 *
 * The CTA branches on whether the club is actually taking new members (Opus
 * Q17, still open). If it is not, the button becomes a non-transactional link
 * to Instagram rather than promising a trial session that does not exist. The
 * section keeps working either way: it is about proof that the place is real,
 * not about selling a slot.
 */

import { Button } from "@/components/ui/Button";
import { Figure } from "@/components/ui/Figure";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { brand, club } from "@/content/site";
import { track } from "@/lib/analytics";
import { openLeadForm } from "@/lib/cta";

/** Until the shoot happens, the rail shows the brief: how many, what shape. */
const PLACEHOLDER_RATIOS = ["3 / 4", "4 / 3", "3 / 4", "1 / 1", "4 / 3"];

export function Club() {
  const tiles = club.photos.length
    ? club.photos.map((src, i) => ({ src, ratio: i % 2 === 0 ? "3 / 4" : "4 / 3" }))
    : PLACEHOLDER_RATIOS.map((ratio) => ({ src: null, ratio }));

  return (
    <section id="klub" aria-labelledby="klub-h" className="section">
      <div className="shell">
        <SectionHeader
          eyebrow={club.eyebrow}
          heading={club.heading}
          headingId="klub-h"
          description={club.caption}
        />
      </div>

      <Reveal className="mt-14 lg:mt-20">
        <div className="drag-row gap-4 px-5 md:gap-5 md:px-10 lg:gap-6 lg:px-20">
          {tiles.map((tile, index) => (
            <Figure
              key={index}
              src={tile.src}
              ratio={tile.ratio}
              sizes="(min-width: 1200px) 30vw, 78vw"
              alt="Зал Crazy Fitness"
              placeholderNote={index === 0 ? "Репортажні кадри залу, 6–10" : undefined}
              className="w-[78vw] rounded-[var(--radius-card)] md:w-[46vw] lg:w-[30vw]"
            />
          ))}
        </div>
      </Reveal>

      <div className="shell mt-12">
        <Reveal className="flex flex-wrap items-center gap-x-10 gap-y-6">
          {club.acceptingNewMembers ? (
            <Button
              onClick={() =>
                openLeadForm({ sourceSection: "club", format: "group" })
              }
            >
              Записатися на пробне
            </Button>
          ) : (
            <Button
              variant="secondary"
              href={brand.instagramUrl}
              onClick={() =>
                track({ name: "instagram_click", params: { source_section: "club" } })
              }
            >
              Стежити за атмосферою в Instagram
            </Button>
          )}

          {brand.address && (
            <address className="t-body not-italic text-muted">{brand.address}</address>
          )}
        </Reveal>
      </div>
    </section>
  );
}
