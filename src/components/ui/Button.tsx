"use client";

/**
 * BUTTON — Stage 14 / Stage 20.
 *
 * Three variants, eight states. Loading keeps the label in the DOM behind an
 * overlay so the button cannot change width mid-submit, which is the jump the
 * blueprint calls out.
 *
 * Magnetic hover (Opus 8.3) is pointer-only and transform-only: it never runs
 * for touch, for coarse pointers, or under prefers-reduced-motion.
 */

import Link from "next/link";
import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "ghost";
type State = "idle" | "loading" | "success" | "error";

const BASE =
  "t-button group relative inline-flex items-center justify-center gap-2 " +
  "rounded-[var(--radius-card)] " +
  "transition-[color,background-color,border-color,scale] duration-200 " +
  "disabled:cursor-not-allowed select-none";

/**
 * 52px tall so the tap target clears the 44px minimum (Stage 16), and a small
 * press: the button gives under the finger and springs back on release. `scale`
 * is a standalone property in Tailwind v4, composing with the magnetic pull
 * (which drives `transform`) rather than fighting it.
 */
const SIZE = "min-h-[52px] px-7 py-3 motion-safe:active:scale-[0.97]";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-orange text-on-accent hover:bg-orange-hover " +
    "disabled:bg-line disabled:text-subtle",
  secondary:
    "border border-line text-body hover:border-orange " +
    "disabled:border-line disabled:text-subtle",
  // The ghost variant has to read as a text link, so it cannot be padded out
  // to 44px without losing its underline. Instead an invisible ::before
  // extends the hit area vertically: identical visually, thumb-sized in fact.
  ghost:
    "px-0 min-h-0 py-1 text-body hover:text-accent-text " +
    "before:absolute before:inset-x-0 before:-top-3 before:-bottom-3 before:content-[''] " +
    "after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full " +
    "after:origin-left after:scale-x-0 after:bg-orange " +
    "after:transition-transform after:duration-300 " +
    "hover:after:scale-x-100 disabled:text-subtle",
};

type CommonProps = {
  variant?: Variant;
  state?: State;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  /**
   * Marks a button that opens the lead form, so the mobile sticky bar can get
   * out of its way. Without it the bar sat on top of the section CTA it
   * duplicates: two identical orange buttons a pixel apart, the lower one
   * clipped. Only meaningful on the button form; links do not spread it.
   */
  "data-primary-cta"?: string;
};

type AsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
  };

type AsLink = CommonProps & {
  href: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
};

export type ButtonProps = AsButton | AsLink;

function useMagnetic<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null);
  const setter = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(
    null,
  );

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || calm.matches) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    // GSAP is loaded on demand so it never blocks first paint. Stage 21.
    import("gsap").then(({ gsap }) => {
      if (disposed) return;
      setter.current = {
        x: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" }),
      };

      const onMove = (event: PointerEvent) => {
        const box = el.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        const limit = 6;
        setter.current?.x(Math.max(-limit, Math.min(limit, dx * 0.3)));
        setter.current?.y(Math.max(-limit, Math.min(limit, dy * 0.3)));
      };

      const onLeave = () => {
        setter.current?.x(0);
        setter.current?.y(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      cleanup = () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        gsap.killTweensOf(el);
      };
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [enabled]);

  return ref;
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 grid place-items-center"
    >
      <span className="block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    </span>
  );
}

/**
 * The label rolls on hover: the visible copy slides up and out while an
 * identical copy rises from below to replace it, so the button reacts with a
 * small mechanical turn rather than only changing colour.
 *
 * The transition names `translate`, not `transform`: Tailwind v4 compiles
 * -translate-y-full to the standalone translate property, and the magnetic
 * pull already owns `transform`, so this keeps the two off each other.
 *
 * Gated on motion-safe: under reduced motion the incoming copy stays clipped
 * below and nothing moves, leaving a plain button whose colour still responds.
 * The second copy is aria-hidden so the label is not read twice.
 */
function RollingLabel({ children }: { children: ReactNode }) {
  const row =
    "flex items-center justify-center gap-2 " +
    "transition-[translate] duration-[420ms] ease-[var(--ease-out-strong)]";
  return (
    <span className="relative block overflow-hidden">
      <span className={`${row} motion-safe:group-hover:-translate-y-full`}>
        {children}
      </span>
      <span
        aria-hidden="true"
        className={`${row} absolute inset-0 translate-y-full motion-safe:group-hover:translate-y-0`}
      >
        {children}
      </span>
    </span>
  );
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    state = "idle",
    children,
    className = "",
    fullWidth,
  } = props;

  const magnetic = variant === "primary" && state === "idle";
  const anchorRef = useMagnetic<HTMLAnchorElement>(magnetic);
  const buttonRef = useMagnetic<HTMLButtonElement>(magnetic);

  const classes = [
    BASE,
    variant === "ghost" ? "" : SIZE,
    VARIANT[variant],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Ghost reads as a text link and keeps its underline sweep; the roll would
  // clip its descenders and fight the underline, so only the filled and
  // outlined variants get it.
  const label =
    variant === "ghost" ? (
      <span>{children}</span>
    ) : (
      <RollingLabel>{children}</RollingLabel>
    );

  const body = (
    <>
      <span className={state === "loading" ? "invisible" : undefined}>
        {label}
      </span>
      {state === "loading" && <Spinner />}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    const { href, onClick, target, rel } = props;
    const external = href.startsWith("http");

    if (external) {
      return (
        <a
          ref={anchorRef}
          href={href}
          onClick={onClick}
          target={target ?? "_blank"}
          rel={rel ?? "noopener noreferrer"}
          className={classes}
        >
          {body}
        </a>
      );
    }

    return (
      <Link ref={anchorRef} href={href} onClick={onClick} className={classes}>
        {body}
      </Link>
    );
  }

  const { variant: _v, state: _s, className: _c, fullWidth: _f, ...rest } =
    props as AsButton;

  return (
    <button
      ref={buttonRef}
      {...rest}
      disabled={rest.disabled || state === "loading"}
      aria-busy={state === "loading" || undefined}
      className={classes}
    >
      {body}
    </button>
  );
}
