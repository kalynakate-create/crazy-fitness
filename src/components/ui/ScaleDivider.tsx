"use client";

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
 *
 * The ticks answer the cursor, rising as it passes and settling behind it. A
 * measuring rule is an instrument you put your hand on, so it is the one place
 * on the page where touching something is the point rather than an effect.
 * Pointer-only, transform-only, and completely inert under reduced motion.
 */

import { useEffect, useRef } from "react";

type ScaleDividerProps = {
  /** Labels sit under their own tick, so the rule marks real positions. */
  labels?: string[];
  className?: string;
};

const TICK_GAP = 12;
/** How far the cursor's influence reaches, in pixels. */
const REACH = 96;
/** Tallest a tick grows to, as a multiple of its resting height. */
const LIFT = 2.4;

function useCursorTicks<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    /* Ticks are built regardless of input device: they are the rule itself and
       look identical to the painted version. Only the reaction is gated, and
       on reduced motion alone rather than on hover support, so a laptop with a
       touchscreen still gets it. A touch device emits pointermove only while a
       finger is down, where a brief rise is harmless. */
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    let ticks: HTMLElement[] = [];
    let frame = 0;
    let pointerX: number | null = null;

    const build = () => {
      const width = host.clientWidth;
      if (!width) return;
      const count = Math.max(8, Math.floor(width / TICK_GAP));
      host.replaceChildren();
      ticks = Array.from({ length: count }, () => {
        const tick = document.createElement("span");
        tick.className = "cf-tick";
        host.appendChild(tick);
        return tick;
      });
    };

    const paint = () => {
      frame = 0;
      const box = host.getBoundingClientRect();
      ticks.forEach((tick, i) => {
        if (pointerX === null) {
          tick.style.transform = "scaleY(1)";
          tick.style.opacity = "1";
          return;
        }
        const tickX = ((i + 0.5) / ticks.length) * box.width;
        const distance = Math.abs(tickX - pointerX);
        const influence = Math.max(0, 1 - distance / REACH);
        // Ease the falloff so the crest is rounded rather than a spike.
        const eased = influence * influence * (3 - 2 * influence);
        tick.style.transform = `scaleY(${1 + eased * (LIFT - 1)})`;
        tick.style.opacity = `${1 - eased * 0.35}`;
      });
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(paint);
    };

    const onMove = (event: PointerEvent) => {
      pointerX = event.clientX - host.getBoundingClientRect().left;
      schedule();
    };
    const onLeave = () => {
      pointerX = null;
      schedule();
    };

    build();
    const observer = new ResizeObserver(() => {
      build();
      schedule();
    });
    observer.observe(host);

    if (!calm.matches) {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
    }

    return () => {
      observer.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      host.replaceChildren();
    };
  }, []);

  return ref;
}

export function ScaleDivider({ labels, className = "" }: ScaleDividerProps) {
  const ref = useCursorTicks<HTMLDivElement>();

  const rule = (
    /* Falls back to the CSS-drawn rule when the effect does not run: the
       element keeps its painted ticks and simply does not react. */
    <div ref={ref} className="cf-rule scale-rule" aria-hidden="true" />
  );

  if (!labels?.length) {
    return <div className={className}>{rule}</div>;
  }

  return (
    <div className={className}>
      {rule}
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
  return <div className={`scale-rule-v h-24 ${className}`} aria-hidden="true" />;
}
