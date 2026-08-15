/**
 * 02 TRUST STRIP — Stage 3.
 *
 * Renders only with at least two confirmed facts. With one, the band would be
 * a lonely element pretending to be a section; with none, an empty stripe. The
 * blueprint forbids inventing a number to fill it, so the honest third state is
 * for the section not to exist. Add facts in content/site.ts as Anastasia
 * confirms them and this appears on its own.
 */

import { Marquee } from "@/components/ui/Marquee";
import { ScaleDivider } from "@/components/ui/ScaleDivider";
import { trustFacts } from "@/content/site";

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex items-baseline gap-3 whitespace-nowrap px-6">
      <span className="font-[family-name:var(--font-display)] text-[15px] font-bold uppercase tracking-[-0.01em] text-body">
        {value}
      </span>
      <span className="t-eyebrow normal-case tracking-[0.06em]">{label}</span>
    </span>
  );
}

export function TrustStrip() {
  if (trustFacts.length < 2) return null;

  return (
    <section aria-label="Коротко про Crazy Fitness" className="border-y border-line bg-raised">
      {/* Mobile: the facts move, because four of them will not fit still. */}
      <div className="py-5 lg:hidden">
        <Marquee duration={32}>
          {trustFacts.map((fact) => (
            <Fact key={fact.value} value={fact.value} label={fact.label} />
          ))}
        </Marquee>
      </div>

      {/* Desktop: the facts sit on the measuring rule, one tick each, exactly
          as the Stage 25 wireframe draws it. The rule is the interactive one,
          so this is where the motif is closest to hand. */}
      <div className="shell hidden lg:block">
        <ScaleDivider className="pt-6" />
        <ul className="flex items-stretch justify-between divide-x divide-line py-7">
          {trustFacts.map((fact) => (
            <li key={fact.value} className="flex-1 px-8 first:pl-0 last:pr-0">
              <p className="font-[family-name:var(--font-display)] text-[18px] font-bold uppercase tracking-[-0.01em] text-body">
                {fact.value}
              </p>
              <p className="t-eyebrow mt-2 normal-case tracking-[0.06em]">
                {fact.label}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
