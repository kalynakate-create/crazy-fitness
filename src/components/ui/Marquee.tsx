"use client";

/**
 * MARQUEE — Stage 14.
 *
 * Used for the mobile trust strip and the proof feed. The track is duplicated
 * once and translated by exactly -50%, so the loop is seamless without JS.
 *
 * Under prefers-reduced-motion the animation stops and the row becomes a
 * normal horizontally scrollable list, so the content is still reachable
 * rather than frozen mid-slide.
 */

import type { ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  /** Seconds for one full pass. Different speeds per row read as parallax. */
  duration?: number;
  className?: string;
};

export function Marquee({ children, duration = 40, className = "" }: MarqueeProps) {
  return (
    <div
      className={`w-full overflow-x-auto [scrollbar-width:none] motion-safe:overflow-hidden ${className}`}
    >
      {/* Pauses under the cursor. A line that never stops is a line you cannot
          finish reading, and these are the facts the section exists to state. */}
      <div
        className="marquee-track motion-safe:hover:[animation-play-state:paused]"
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
