/**
 * LOGO
 *
 * Renders the real artwork when it exists in /public/logo/ and a type-set
 * stand-in when it does not. The stand-in holds the correct size and spacing
 * and is deliberately NOT a redrawing of the real monogram: tracing the CF
 * ligature and dumbbell by eye from a screenshot produces a wrong logo that
 * looks right enough to ship by accident.
 *
 * To swap in the real thing: put the files in /public/logo/ and set the paths
 * in `brand.logo` in content/site.ts. Nothing here needs editing.
 *
 * On the dark product band the light variant is required; without it the
 * stand-in is used, because a dark logo on a dark ground is worse than no logo.
 */

import Image from "next/image";
import { brand } from "@/content/site";
import { asset } from "@/lib/asset";

type LogoProps = {
  variant?: "monogram" | "wordmark";
  /** Set on dark surfaces so the light artwork is chosen. */
  onDark?: boolean;
  className?: string;
};

/** Intrinsic ratios, used to reserve space. Measured from the asset: 576x624. */
const MARK_RATIO = 0.923;
const FULL_RATIO = 2.6;

export function Logo({
  variant = "monogram",
  onDark = false,
  className = "",
}: LogoProps) {
  const markSrc = onDark ? brand.logo.markLight : brand.logo.mark;

  if (variant === "monogram") {
    if (markSrc) {
      return (
        <Image
          src={asset(markSrc)}
          alt=""
          aria-hidden="true"
          // 40px inside an 80px bar, 32px inside 64px: the mark takes half the
          // header's height, which is where it stops reading as an afterthought
          // without crowding the rule beneath it.
          width={Math.round(40 * MARK_RATIO)}
          height={40}
          priority
          className={`h-8 w-auto lg:h-10 ${className}`}
        />
      );
    }

    return (
      <span
        className={`font-[family-name:var(--font-display)] text-[22px] font-extrabold leading-none tracking-[-0.04em] text-body ${className}`}
        aria-hidden="true"
      >
        CF
      </span>
    );
  }

  if (brand.logo.full) {
    return (
      <Image
        src={asset(brand.logo.full)}
        alt=""
        aria-hidden="true"
        width={Math.round(72 * FULL_RATIO)}
        height={72}
        className={`h-auto w-full max-w-[320px] ${className}`}
      />
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
