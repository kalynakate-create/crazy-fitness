"use client";

/**
 * 05 ABOUT — Opus 6.2 §05.
 *
 * Deliberately placed after recognition and method, not straight after the
 * hero: the reader needs to care about the problem before she cares who is
 * solving it.
 *
 * Asymmetric by design, portrait against an offset text column, so the one
 * section that is about a person does not sit on the same tidy grid as the
 * service list.
 *
 * The story and the credentials are [CLIENT DATA REQUIRED]. Until they arrive
 * this section shows what is true and nothing else. No invented biography.
 */

import { Button } from "@/components/ui/Button";
import { Figure } from "@/components/ui/Figure";
import { Reveal } from "@/components/ui/Reveal";
import { about, brand } from "@/content/site";
import { openLeadForm } from "@/lib/cta";

export function About() {
  const displayName = brand.fullName ?? brand.ownerName;

  return (
    <section
      id="pro"
      aria-labelledby="pro-h"
      className="section bg-raised"
    >
      <div className="shell">
        <div className="grid-site items-center gap-y-12">
          <Reveal className="col-span-4 md:col-span-4 lg:col-span-6">
            <Figure
              src={about.portrait}
              ratio="4 / 5"
              sizes="(min-width: 1200px) 45vw, 100vw"
              alt={`${displayName}, засновниця Crazy Fitness`}
              placeholderNote="Портрет: 4:5, природне світло"
              className="rounded-[var(--radius-card)]"
            />
          </Reveal>

          <Reveal
            delay={90}
            className="col-span-4 md:col-span-4 lg:col-span-5 lg:col-start-8"
          >
            <p className="t-eyebrow">{about.eyebrow}</p>
            <h2 id="pro-h" className="t-h1 mt-5 text-strong">
              {displayName}
            </h2>

            {about.story && (
              <p className="t-body-l mt-8 max-w-[52ch] text-body/85">
                {about.story}
              </p>
            )}

            {about.credentials && about.credentials.length > 0 && (
              <ul className="mt-8 grid gap-3 border-t border-line pt-8">
                {about.credentials.map((item) => (
                  <li key={item} className="t-body flex gap-4 text-subtle">
                    <span aria-hidden="true" className="mt-2.5 h-px w-5 shrink-0 bg-orange" />
                    {item}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-10">
              <Button
                data-primary-cta=""
                onClick={() => openLeadForm({ sourceSection: "hero" })}
              >
                {about.cta}
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
