/**
 * 02 TRUST STRIP — Stage 3.
 *
 * Renders only with at least two confirmed facts. With one, the band would be
 * a lonely element pretending to be a section; with none, an empty stripe. The
 * blueprint forbids inventing a number to fill it, so the honest third state is
 * for the section not to exist. Add facts in content/site.ts as Anastasia
 * confirms them and this appears on its own.
 *
 * The facts travel. Stage 14 specified a marquee here for mobile only, with a
 * static row on desktop; running it at every width makes the band read as a
 * ticker of what is true rather than as three boxes, and it is what the strip
 * was asked for. It pauses under the cursor so the facts can actually be read,
 * and it stops completely under prefers-reduced-motion, where it degrades to a
 * normal horizontally scrollable row.
 *
 * The rule sits above it, so the facts run along the measuring line rather than
 * beside it.
 */

import { Marquee } from "@/components/ui/Marquee";
import { ScaleDivider } from "@/components/ui/ScaleDivider";
import { trustFacts } from "@/content/site";

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex items-center gap-8 whitespace-nowrap pr-8 lg:gap-12 lg:pr-12">
      <span className="flex flex-col gap-2">
        <span className="font-[family-name:var(--font-display)] text-[17px] font-bold uppercase tracking-[-0.01em] text-strong lg:text-[22px]">
          {value}
        </span>
        <span className="t-eyebrow normal-case tracking-[0.06em]">{label}</span>
      </span>
      <span aria-hidden="true" className="h-10 w-px shrink-0 bg-line lg:h-12" />
    </span>
  );
}

export function TrustStrip() {
  if (trustFacts.length < 2) return null;

  /**
   * Repeated so one half of the track is always wider than the viewport.
   * The track translates by exactly -50%, so a half narrower than the screen
   * would show a gap sweeping through on every cycle.
   */
  const run = [...trustFacts, ...trustFacts];

  return (
    <section
      aria-label="Коротко про Crazy Fitness"
      className="overflow-x-clip border-y border-line bg-raised py-8 lg:py-10"
    >
      <div className="shell">
        <ScaleDivider />
      </div>

      <div className="mt-8 lg:mt-10">
        <Marquee duration={46}>
          {run.map((fact, i) => (
            <Fact key={`${fact.value}-${i}`} value={fact.value} label={fact.label} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
