"use client";

/**
 * 11 FAQ — Stage 11.
 *
 * Sits immediately before the form, which is where objections need to be dealt
 * with, and it is the last thing between the reader and the CTA.
 *
 * Only answered questions render. A question with a placeholder answer would be
 * worse than no FAQ at all, so unanswered ones are filtered out and the section
 * hides itself entirely if none have answers yet. The answers come from
 * Anastasia; there is nothing here for anyone else to draft.
 *
 * Note the reply-time question pulls from brand.responseTime, the same value
 * the form microcopy uses. Stage 11 is explicit that the two must match word
 * for word, so they read from one field and cannot drift.
 */

import { Accordion, type AccordionItem } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { brand, faq } from "@/content/site";
import { track } from "@/lib/analytics";

export function Faq() {
  const answered = faq.filter((item) => item.answer);
  if (answered.length === 0) return null;

  const items: AccordionItem[] = answered.map((item) => ({
    id: item.id,
    summary: <span className="t-h3 text-white">{item.question}</span>,
    content: (
      <p className="t-body max-w-[62ch] text-muted md:pr-16">{item.answer}</p>
    ),
  }));

  return (
    <section id="faq" aria-labelledby="faq-h" className="section shell">
      <SectionHeader
        eyebrow="ЗАПИТАННЯ"
        heading="Перед тим як писати"
        headingId="faq-h"
      />

      <Accordion
        items={items}
        className="mt-14 lg:mt-20"
        onOpen={(id) => track({ name: "faq_item_open", params: { question_id: id } })}
      />

      {brand.telegramUrl && (
        <Reveal className="mt-12">
          <p className="t-body text-muted">
            Не знайшла відповідь?{" "}
            <Button
              variant="ghost"
              href={brand.telegramUrl}
              onClick={() =>
                track({ name: "telegram_click", params: { source_section: "faq" } })
              }
            >
              Напиши в Telegram →
            </Button>
          </p>
        </Reveal>
      )}
    </section>
  );
}
