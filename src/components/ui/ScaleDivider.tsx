/**
 * SIGNATURE ELEMENT — the graduated scale. Stage 12.3 / Opus 8.4.
 *
 * The one motif allowed to repeat across the site. It is a measuring rule, and
 * it only ever marks something that is genuinely counted: steps in the method,
 * position in the page, facts in the trust strip. It is never decoration, which
 * is what keeps it from becoming wallpaper.
 *
 * The dumbbell glyph from the logo stays out of here deliberately: it belongs
 * to logo moments only (favicon, loader), so the two marks do not compete for
 * the role of "the brand element".
 */

type ScaleDividerProps = {
  /** Labels sit under their own tick, so the rule marks real positions. */
  labels?: string[];
  className?: string;
};

export function ScaleDivider({ labels, className = "" }: ScaleDividerProps) {
  if (!labels?.length) {
    return <div className={`scale-rule ${className}`} aria-hidden="true" />;
  }

  return (
    <div className={className}>
      <div className="scale-rule" aria-hidden="true" />
      <div
        className="mt-3 grid gap-4"
        style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0,1fr))` }}
      >
        {labels.map((label) => (
          <span key={label} className="t-eyebrow">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Vertical rule used as the hero scroll indicator, replacing the usual
 * "scroll down" chevron with the same measuring language.
 */
export function ScaleIndicator({ className = "" }: { className?: string }) {
  return (
    <div
      className={`scale-rule-v h-24 ${className}`}
      aria-hidden="true"
    />
  );
}
