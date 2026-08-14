"use client";

/**
 * 13 FOOTER — Opus 8.4 / Stage 25.
 *
 * A giant typographic block, the wordmark running past the right edge. It is
 * the last chance to convert, so the CTA is here too rather than only in the
 * header.
 *
 * Legal links are always present. Contact details, the address and the sole
 * trader registration appear only once they exist; an empty "Контакти" heading
 * over nothing would be worse than no heading.
 */

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CTA_LABEL, brand } from "@/content/site";
import { track } from "@/lib/analytics";
import { openLeadForm } from "@/lib/cta";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-steel bg-ink pt-20 lg:pt-28">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="t-eyebrow">Готова почати?</p>
            <p className="t-h2 mt-5 max-w-[18ch] text-white">
              Розкажи, з чим прийшла
            </p>
          </div>
          <Button onClick={() => openLeadForm({ sourceSection: "hero" })}>
            {CTA_LABEL}
          </Button>
        </div>

        <div className="mt-20 grid gap-10 border-t border-steel pt-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="t-eyebrow mb-5">Зв'язок</p>
            <ul className="grid gap-3">
              <li>
                <a
                  href={brand.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    track({ name: "instagram_click", params: { source_section: "hero" } })
                  }
                  className="t-body inline-block py-1 text-chalk transition-colors hover:text-orange"
                >
                  Instagram {brand.instagramHandle}
                </a>
              </li>
              {brand.telegramUrl && (
                <li>
                  <a
                    href={brand.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track({ name: "telegram_click", params: { source_section: "hero" } })
                    }
                    className="t-body inline-block py-1 text-chalk transition-colors hover:text-orange"
                  >
                    Telegram
                  </a>
                </li>
              )}
              {brand.email && (
                <li>
                  <a
                    href={`mailto:${brand.email}`}
                    className="t-body inline-block py-1 text-chalk transition-colors hover:text-orange"
                  >
                    {brand.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <p className="t-eyebrow mb-5">Сайт</p>
            <ul className="grid gap-3">
              <li>
                <Link href="/#poslugy" className="t-body inline-block py-1 text-chalk hover:text-orange">
                  Послуги
                </Link>
              </li>
              <li>
                <Link href="/program" className="t-body inline-block py-1 text-chalk hover:text-orange">
                  Програма харчування
                </Link>
              </li>
              <li>
                <Link href="/#pro" className="t-body inline-block py-1 text-chalk hover:text-orange">
                  Про мене
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="t-eyebrow mb-5">Документи</p>
            <ul className="grid gap-3">
              <li>
                <Link href="/privacy" className="t-body inline-block py-1 text-chalk hover:text-orange">
                  Політика конфіденційності
                </Link>
              </li>
              <li>
                <Link href="/offer" className="t-body inline-block py-1 text-chalk hover:text-orange">
                  Публічна оферта
                </Link>
              </li>
            </ul>
          </div>

          {(brand.address || brand.legalEntity) && (
            <div>
              <p className="t-eyebrow mb-5">Реквізити</p>
              {brand.address && (
                <address className="t-body not-italic text-muted">{brand.address}</address>
              )}
              {brand.legalEntity && (
                <p className="t-body mt-3 text-muted">{brand.legalEntity}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* The wordmark runs off the edge on purpose: it is a sign, not a label.
          Decorative and aria-hidden (the brand name is in the line below in
          real text), but set in `steel` rather than `surface`: at `surface` it
          was invisible, which is not the same thing as restrained. */}
      <div className="mt-20 overflow-hidden border-t border-steel">
        <p
          aria-hidden="true"
          className="whitespace-nowrap pt-8 font-[family-name:var(--font-display)] text-[18vw] font-extrabold uppercase leading-[0.8] tracking-[-0.05em] text-steel"
        >
          Crazy Fitness
        </p>
      </div>

      <div className="shell flex flex-wrap items-center justify-between gap-4 py-8">
        <p className="t-eyebrow">
          © {year} Crazy Fitness by {brand.ownerName}
        </p>
        <p className="t-eyebrow">
          Матеріали сайту не є медичною порадою
        </p>
      </div>
    </footer>
  );
}
