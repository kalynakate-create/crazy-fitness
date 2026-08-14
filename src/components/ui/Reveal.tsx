"use client";

/**
 * SCROLL REVEAL — Stage 15.
 *
 * IntersectionObserver rather than ScrollTrigger on purpose. The blueprint
 * rejects Framer Motion for exactly this reason (Opus 9.5: do not drag a whole
 * library in for three reveals), and the same logic applies to loading
 * ScrollTrigger on every section. GSAP is reserved for the work only GSAP can
 * do well: the orchestrated hero, the method progress line, magnetic hover.
 *
 * Animates opacity and transform only, and does nothing at all when the
 * visitor has asked for reduced motion.
 */

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger in ms, for lists where order carries meaning. */
  delay?: number;
  as?: ElementType;
  className?: string;
};

export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("reveal-in");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          target.style.transitionDelay = `${delay}ms`;
          target.classList.add("reveal-in");
          observer.unobserve(target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
