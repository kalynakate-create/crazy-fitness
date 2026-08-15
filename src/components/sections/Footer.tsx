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
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { CTA_LABEL, brand } from "@/content/site";
import { track } from "@/lib/analytics";
import { openLeadForm } from "@/lib/cta";

/**
 * A footer navigation column. Its links are laid out as a divided index, each
 * on its own hairline-separated row, rather than a loose stack of text. The
 * label of the eyebrow above sits on the first rule, so the whole column reads
 * as one measured list.
 */
function FootColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <nav aria-label={title}>
      <p className="t-eyebrow mb-4">{title}</p>
      <ul className="border-t border-line">{children}</ul>
    </nav>
  );
}

/**
 * A footer link, in the site's own interaction language: on hover and on
 * keyboard focus an orange underline sweeps in from the left, the label steps
 * to the right, and an arrow slides out. The whole row is the target.
 *
 * Handles internal routes and external links from one call site so the three
 * columns share exactly one implementation.
 */
function FootLink({
  href,
  external = false,
  onClick,
  children,
}: {
  href: string;
  external?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  const inner = (
    <>
      {/* The underline that draws itself. scale-x, so it names `scale` in the
          transition, not `transform`: Tailwind v4 compiles it to the standalone
          property. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-orange transition-[scale] duration-300 ease-[var(--ease-out-strong)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
      <span className="t-body text-body transition-[translate,color] duration-300 ease-[var(--ease-out-strong)] group-hover:translate-x-1 group-hover:text-accent-text group-focus-visible:translate-x-1 group-focus-visible:text-accent-text">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="translate-x-[-6px] text-accent-text opacity-0 transition-[translate,opacity] duration-300 ease-[var(--ease-out-strong)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      >
        →
      </span>
    </>
  );

  const className =
    "group relative flex items-center justify-between gap-4 border-b border-line py-4";

  return (
    <li>
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className={className}
        >
          {inner}
        </a>
      ) : (
        <Link href={href} onClick={onClick} className={className}>
          {inner}
        </Link>
      )}
    </li>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-page pt-20 lg:pt-28">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            {/* Deliberately not "Розкажи, з чим прийшла": that is the lead
                form's own heading a few hundred pixels above, and repeating it
                made the page look like it had lost its place. */}
            <p className="t-eyebrow">Наступний крок</p>
            <p className="t-h2 mt-5 max-w-[18ch] text-strong">
              Відповім особисто
            </p>
          </div>
          <Button onClick={() => openLeadForm({ sourceSection: "hero" })}>
            {CTA_LABEL}
          </Button>
        </div>

        <div className="mt-20 grid gap-10 border-t border-line pt-12 md:grid-cols-2 lg:grid-cols-4">
          <FootColumn title="Зв'язок">
            <FootLink
              href={brand.instagramUrl}
              external
              onClick={() =>
                track({ name: "instagram_click", params: { source_section: "hero" } })
              }
            >
              Instagram {brand.instagramHandle}
            </FootLink>
            {brand.telegramUrl && (
              <FootLink
                href={brand.telegramUrl}
                external
                onClick={() =>
                  track({ name: "telegram_click", params: { source_section: "hero" } })
                }
              >
                Telegram
              </FootLink>
            )}
            {brand.email && (
              <FootLink href={`mailto:${brand.email}`} external>
                {brand.email}
              </FootLink>
            )}
          </FootColumn>

          <FootColumn title="Сайт">
            <FootLink href="/#poslugy">Послуги</FootLink>
            <FootLink href="/program">Програма харчування</FootLink>
            <FootLink href="/#pro">Про мене</FootLink>
          </FootColumn>

          <FootColumn title="Документи">
            <FootLink href="/privacy">Політика конфіденційності</FootLink>
            <FootLink href="/offer">Публічна оферта</FootLink>
          </FootColumn>

          {/* Address and ФОП details are different things and no longer share
              a heading: the club address is a place you go, "Реквізити" is the
              legal registration. The requisites block appears only once the
              ФОП details exist, rather than standing over an address. */}
          {(brand.address || brand.legalEntity) && (
            <div className="grid gap-8">
              {brand.address && (
                <div>
                  <p className="t-eyebrow mb-5">Клуб</p>
                  <address className="t-body not-italic text-subtle">
                    {brand.address}
                  </address>
                </div>
              )}
              {brand.legalEntity && (
                <div>
                  <p className="t-eyebrow mb-5">Реквізити</p>
                  <p className="t-body text-subtle">{brand.legalEntity}</p>
                </div>
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
        <Wordmark
          text="Crazy Fitness"
          className="whitespace-nowrap pt-8 text-center font-[family-name:var(--font-display)] text-[9.6vw] font-extrabold uppercase leading-[0.85] tracking-[-0.04em] text-line"
        />
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
