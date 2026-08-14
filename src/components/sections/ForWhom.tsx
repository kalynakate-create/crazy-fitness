"use client";

/**
 * 03 FOR WHOM — Opus 6.2 §03.
 *
 * Recognition before persuasion. Text only, no imagery: the reader is supposed
 * to find herself in one of these lines, and a stock photo of someone else in a
 * gym actively works against that.
 *
 * These are states, never diagnoses. The site does not tell anyone what is
 * wrong with them.
 */

import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { forWhom } from "@/content/site";
import { openLeadForm } from "@/lib/cta";

export function ForWhom() {
  return (
    <section
      id="dlya-kogo"
      aria-labelledby="dlya-kogo-h"
      className="section shell"
    >
      <Reveal>
        <p className="t-eyebrow">{forWhom.eyebrow}</p>
        <h2 id="dlya-kogo-h" className="t-h1 mt-5 max-w-[16ch] text-white">
          {forWhom.heading}
        </h2>
      </Reveal>

      <ul className="mt-14 border-t border-steel lg:mt-20">
        {forWhom.states.map((state, index) => (
          <Reveal as="li" key={state} delay={index * 70}>
            <p className="t-h3 border-b border-steel py-8 text-chalk lg:py-10">
              {state}
            </p>
          </Reveal>
        ))}
      </ul>

      <Reveal className="mt-12">
        <Button onClick={() => openLeadForm({ sourceSection: "hero" })}>
          {forWhom.cta}
        </Button>
      </Reveal>
    </section>
  );
}
