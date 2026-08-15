/**
 * SECTION HEADER — Stage 14 / Stage 5.
 *
 * Eyebrow, H2, optional description. The tracked mono eyebrow above a heavy
 * display heading is lifted straight from the logo's own rhythm: "CRAZY
 * FITNESS" set solid with "BY ANASTASIA" tracked out beneath it. Reusing that
 * pairing ties every section back to the mark instead of inventing a separate
 * UI mannerism.
 */

import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type SectionHeaderProps = {
  eyebrow?: string;
  heading: ReactNode;
  description?: ReactNode;
  /** The id an aria-labelledby on the section points at. Stage 22. */
  headingId?: string;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  heading,
  description,
  headingId,
  className = "",
}: SectionHeaderProps) {
  return (
    <Reveal className={className}>
      {eyebrow && <p className="t-eyebrow mb-4">{eyebrow}</p>}
      <h2 id={headingId} className="t-h2 text-strong">
        {heading}
      </h2>
      {description && (
        <p className="t-body-l mt-6 max-w-[65ch] text-subtle">{description}</p>
      )}
    </Reveal>
  );
}
