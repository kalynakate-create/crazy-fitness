"use client";

/**
 * HEADER — Stage 25.
 *
 * Transparent over the hero, solid once the page moves. The monogram alone,
 * not the full wordmark: it is already the recognisable mark and it keeps the
 * bar under 80px so the hero keeps its full height.
 *
 * The burger lives at the top and the sticky CTA at the bottom, so the two
 * never fight for the same corner of a phone screen (Stage 16).
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { CTA_LABEL, nav } from "@/content/site";
import { track } from "@/lib/analytics";
import { openLeadForm, seedCtaFromUrl } from "@/lib/cta";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    seedCtaFromUrl();
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const goToForm = () => {
    setMenuOpen(false);
    track({
      name: "hero_cta_click",
      params: { cta_label: CTA_LABEL, target: "#zapys" },
    });
    openLeadForm({ sourceSection: "hero" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled || menuOpen
          ? "border-b border-line bg-page/95 backdrop-blur"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link
          href="/#top"
          aria-label="Crazy Fitness, на початок"
          // Negative margin plus padding: same position, 44px hit area.
          className="-m-3 flex items-center p-3"
          onClick={() => setMenuOpen(false)}
        >
          <Logo variant="monogram" />
        </Link>

        <nav aria-label="Головне меню" className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="t-body text-subtle transition-colors hover:text-body"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <Button onClick={goToForm}>{CTA_LABEL}</Button>
        </div>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
          onClick={() => setMenuOpen((v) => !v)}
          className="grid size-11 place-items-center lg:hidden"
        >
          <span aria-hidden="true" className="relative block h-3 w-6">
            <span
              className={`absolute left-0 block h-px w-full bg-body transition-transform duration-300 ${
                menuOpen ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-full bg-body transition-transform duration-300 ${
                menuOpen ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="border-t border-line bg-page lg:hidden"
      >
        <nav aria-label="Мобільне меню" className="shell py-8">
          <ul className="grid gap-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="t-h3 block py-3 text-body"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Button fullWidth onClick={goToForm}>
              {CTA_LABEL}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
