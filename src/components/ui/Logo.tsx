/**
 * LOGO — placeholder, awaiting the vector file.
 *
 * ⚠ SWAP POINT. Stage 24 lists "логотип у векторі (SVG/AI/PDF), світла + темна
 * версія" as required before design. The four rasters we have show the mark on
 * white and on orange only, never on `ink`, so its contrast on the actual page
 * background is still unverified (Stage 12.1 flags this as an explicit action).
 *
 * What renders below is set in the site's own display face. It is a stand-in
 * that holds the correct size and spacing, deliberately NOT a redrawing of the
 * real monogram: tracing the CF ligature and dumbbell by eye from a JPEG would
 * produce a wrong logo that looks right enough to ship by accident.
 *
 * To swap: drop the SVG into /public/logo/ and replace the two spans below.
 */

type LogoProps = {
  variant?: "monogram" | "wordmark";
  className?: string;
};

export function Logo({ variant = "monogram", className = "" }: LogoProps) {
  if (variant === "monogram") {
    return (
      <span
        className={`font-[family-name:var(--font-display)] text-[22px] font-extrabold leading-none tracking-[-0.04em] text-body ${className}`}
        aria-hidden="true"
      >
        CF
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col gap-1 ${className}`} aria-hidden="true">
      <span className="font-[family-name:var(--font-display)] text-[clamp(28px,6vw,56px)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-body">
        Crazy <span className="text-accent-text">Fitness</span>
      </span>
      <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.35em] text-subtle">
        by Anastasia
      </span>
    </span>
  );
}
