"use client";

/**
 * 09 RESULTS / REVIEWS — Stage 10.
 *
 * Three launch states, and which one renders is decided by how many real
 * reviews exist, never by how the layout would look:
 *
 *   0    the section is dropped from the release and returns as its own update
 *   1-2  one large quote, because inflating two items into a "feed" is a lie
 *        told with layout
 *   3+   the full mixed proof grid
 *
 * Nothing renders without written consent on file. Opus 6.2 §09 and Stage 24
 * both make that a hard gate, and it is enforced here rather than trusted to
 * whoever edits the content file.
 */

import { Button } from "@/components/ui/Button";
import { Figure } from "@/components/ui/Figure";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { reviews } from "@/content/site";
import { track } from "@/lib/analytics";
import { openLeadForm } from "@/lib/cta";
import { useOnceInView } from "@/lib/use-once-in-view";

export function Reviews() {
  const publishable = reviews.filter((review) => review.consentOnFile);
  const viewRef = useOnceInView<HTMLDivElement>(() =>
    track({ name: "results_section_view" }),
  );

  if (publishable.length === 0) return null;

  const single = publishable.length < 3;

  return (
    <section id="rezultaty" aria-labelledby="rezultaty-h" className="section shell">
      <div ref={viewRef}>
        <SectionHeader
          eyebrow="РЕЗУЛЬТАТИ"
          heading="Не обіцянки — процес"
          headingId="rezultaty-h"
        />
      </div>

      {single ? (
        <Reveal className="mt-14 lg:mt-20">
          <figure className="max-w-[24ch] lg:max-w-[20ch]">
            <blockquote className="t-h2 text-strong">
              {publishable[0]!.quote}
            </blockquote>
            {publishable[0]!.author && (
              <figcaption className="t-eyebrow mt-8">
                {publishable[0]!.author}
              </figcaption>
            )}
          </figure>
        </Reveal>
      ) : (
        <div className="mt-14 columns-1 gap-5 md:columns-2 lg:mt-20 lg:columns-3 lg:gap-6">
          {publishable.map((review, index) => (
            <Reveal key={review.id} delay={index * 60} className="mb-5 break-inside-avoid lg:mb-6">
              {review.kind === "quote" ? (
                <figure className="rounded-[var(--radius-card)] border border-line p-7">
                  <blockquote className="t-body-l text-body">{review.quote}</blockquote>
                  {review.author && (
                    <figcaption className="t-eyebrow mt-6">{review.author}</figcaption>
                  )}
                </figure>
              ) : (
                <Figure
                  src={review.image ?? null}
                  ratio={review.kind === "screenshot" ? "9 / 16" : "4 / 5"}
                  sizes="(min-width: 1200px) 30vw, 100vw"
                  alt={review.author ? `Відгук, ${review.author}` : "Відгук"}
                  className="rounded-[var(--radius-card)]"
                />
              )}
            </Reveal>
          ))}
        </div>
      )}

      <Reveal className="mt-16">
        <Button onClick={() => openLeadForm({ sourceSection: "hero" })}>
          Записатися на консультацію
        </Button>
      </Reveal>
    </section>
  );
}
