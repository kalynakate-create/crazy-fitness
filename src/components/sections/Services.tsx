"use client";

/**
 * 06 SERVICES — Stage 6.
 *
 * An accordion, not a card grid, on every breakpoint. Three services do not
 * look sparse and seven do not become an endless scroll, because only one is
 * ever open. The final list is still [УТОЧНИТИ]; adding or removing rows in
 * content/site.ts needs no layout work here.
 *
 * Opening a service and then being asked to pick the same format again in the
 * form would be the site forgetting what you just told it, so the CTA carries
 * the choice into step 2.
 */

import { Accordion, type AccordionItem } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { services } from "@/content/site";
import { openLeadForm } from "@/lib/cta";
import { priceLabel } from "@/lib/format";

export function Services() {
  const items: AccordionItem[] = services.map((service, index) => ({
    id: service.id,
    summary: (
      <span className="flex flex-col gap-3 md:flex-row md:items-baseline md:gap-8">
        <span className="font-[family-name:var(--font-mono)] text-[13px] tracking-[0.12em] text-orange md:w-10">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex-1">
          <span className="t-h3 block text-white">{service.name}</span>
          <span className="t-body mt-1 block text-muted">{service.hook}</span>
        </span>
        <span className="font-[family-name:var(--font-mono)] text-[13px] text-chalk md:text-right">
          {priceLabel(service.priceFromAmount)}
        </span>
      </span>
    ),
    content: (
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end md:gap-14 md:pl-[72px]">
        <div>
          <ul className="grid gap-3">
            {service.includes.map((line) => (
              <li key={line} className="t-body flex gap-4 text-chalk/85">
                <span aria-hidden="true" className="mt-2.5 h-px w-5 shrink-0 bg-orange" />
                {line}
              </li>
            ))}
          </ul>

          <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-3 border-t border-steel pt-6 font-[family-name:var(--font-mono)] text-[13px]">
            <div className="flex gap-3">
              <dt className="text-muted">Кому:</dt>
              <dd className="max-w-[42ch] text-chalk">{service.forWhom}</dd>
            </div>
            {service.duration && (
              <div className="flex gap-3">
                <dt className="text-muted">Тривалість:</dt>
                <dd className="text-chalk">{service.duration}</dd>
              </div>
            )}
          </dl>
        </div>

        <Button
          onClick={() =>
            openLeadForm({
              sourceSection: "services",
              format: service.prefillFormat,
              goal: service.prefillGoal,
            })
          }
        >
          Записатися
        </Button>
      </div>
    ),
  }));

  return (
    <section id="poslugy" aria-labelledby="poslugy-h" className="section shell">
      <SectionHeader eyebrow="ПОСЛУГИ" heading="Обери формат" headingId="poslugy-h" />
      <Accordion items={items} className="mt-14 lg:mt-20" />
    </section>
  );
}
