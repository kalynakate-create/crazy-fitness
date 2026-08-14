"use client";

import { useEffect, useRef } from "react";

/**
 * Fires a callback the first time an element is meaningfully on screen, then
 * disconnects. Used for view-type analytics events (Stage 23), which should
 * report once per page view and never on every intersection.
 */
export function useOnceInView<T extends HTMLElement>(
  onEnter: () => void,
  threshold = 0.4,
) {
  const ref = useRef<T>(null);
  const handler = useRef(onEnter);
  handler.current = onEnter;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let fired = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !fired) {
            fired = true;
            handler.current();
            observer.disconnect();
          }
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
