"use client";

/**
 * The giant footer wordmark, with the letters answering the cursor.
 *
 * Decorative and aria-hidden: the brand name is present as real text in the
 * footer's copyright line, so splitting this into per-letter spans costs
 * nothing to a screen reader.
 *
 * The lift is small on purpose. This is the last thing on the page and it
 * should feel like something settling, not a toy. Pointer-only, transform and
 * colour only, and inert under reduced motion.
 */

import { useEffect, useRef } from "react";

const REACH = 190;
const LIFT_PX = 14;

export function Wordmark({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const hostRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Gated on reduced motion alone, not on hover support: a touchscreen
    // laptop is still a mouse machine, and pointermove simply never arrives
    // on a device without one.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const letters = Array.from(
      host.querySelectorAll<HTMLElement>("[data-letter]"),
    );
    let frame = 0;
    let pointerX: number | null = null;

    const paint = () => {
      frame = 0;
      for (const letter of letters) {
        if (pointerX === null) {
          letter.style.transform = "translateY(0)";
          letter.style.color = "";
          continue;
        }
        const box = letter.getBoundingClientRect();
        const centre = box.left + box.width / 2;
        const influence = Math.max(0, 1 - Math.abs(centre - pointerX) / REACH);
        const eased = influence * influence * (3 - 2 * influence);
        letter.style.transform = `translateY(${-eased * LIFT_PX}px)`;
        // Toward the ink as it rises, so the crest reads as nearer rather than
        // merely higher.
        letter.style.color =
          eased > 0.02
            ? `color-mix(in oklab, var(--color-subtle) ${eased * 100}%, var(--color-line))`
            : "";
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(paint);
    };

    const onMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      schedule();
    };
    const onLeave = () => {
      pointerX = null;
      schedule();
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [text]);

  return (
    <p ref={hostRef} aria-hidden="true" className={className}>
      {Array.from(text).map((character, index) =>
        character === " " ? (
          <span key={index} className="inline-block w-[0.28em]" />
        ) : (
          <span
            key={index}
            data-letter
            className="inline-block transition-[transform,color] duration-300 ease-[var(--ease-out-strong)]"
          >
            {character}
          </span>
        ),
      )}
    </p>
  );
}
