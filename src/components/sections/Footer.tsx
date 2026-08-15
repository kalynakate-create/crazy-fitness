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
    <footer className="border-t border-line bg-page pt-20 lg:pt-28">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="t-eyebrow">Готова почати?</p>
            <p className="t-h2 mt-5 max-w-[18ch] text-strong">
              Розкажи, з чим прийшла
            </p>
          </div>
          <Button onClick={() => openLeadForm({ sourceSection: "hero" })}>
            {CTA_LABEL}
          </Button>
        </div>

        <div className="mt-20 grid gap-10 border-t border-line pt-12 md:grid-cols-2 lg:grid-cols-4">
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
                  className="t-body inline-block py-1 text-body transition-colors hover:text-accent-text"
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
                    className="t-body inline-block py-1 text-body transition-colors hover:text-accent-text"
                  >
                    Telegram
                  </a>
                </li>
              )}
              {brand.email && (
                <li>
                  <a
                    href={`mailto:${brand.email}`}
                    className="t-body inline-block py-1 text-body transition-colors hover:text-accent-text"
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
                <Link href="/#poslugy" className="t-body inline-block py-1 text-body hover:text-accent-text">
                  Послуги
                </Link>
              </li>
              <li>
                <Link href="/program" className="t-body inline-block py-1 text-body hover:text-accent-text">
                  Програма харчування
                </Link>
              </li>
              <li>
                <Link href="/#pro" className="t-body inline-block py-1 text-body hover:text-accent-text">
                  Про мене
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="t-eyebrow mb-5">Документи</p>
            <ul className="grid gap-3">
              <li>
                <Link href="/privacy" className="t-body inline-block py-1 text-body hover:text-accent-text">
                  Політика конфіденційності
                </Link>
              </li>
              <li>
                <Link href="/offer" className="t-body inline-block py-1 text-body hover:text-accent-text">
                  Публічна оферта
                </Link>
              </li>
            </ul>
          </div>

          {(brand.address || brand.legalEntity) && (
            <div>
              <p className="t-eyebrow mb-5">Реквізити</p>
              {brand.address && (
                <address className="t-body not-italic text-subtle">{brand.address}</address>
              )}
              {brand.legalEntity && (
                <p className="t-body mt-3 text-subtle">{brand.legalEntity}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sized to fit rather than cropped at the edge. At 18vw the wordmark ran
          past the viewport and lost its last letters, which read as a bug
          rather than as a deliberate bleed. Measured: the wordmark is 9.75x its
          font size, so 9.6vw keeps all thirteen characters on screen at every
          width with room to spare. Decorative and aria-hidden; the brand name
          is in real text on the line below. */}
      <div className="mt-20 overflow-hidden border-t border-line">
        <p
          aria-hidden="true"
          className="whitespace-nowrap pt-8 text-center font-[family-name:var(--font-display)] text-[9.6vw] font-extrabold uppercase leading-[0.85] tracking-[-0.04em] text-line"
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
