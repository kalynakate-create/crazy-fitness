"use client";

/**
 * CONTENT GAPS — a live version of the Stage 24 checklist. Development only;
 * this component returns null in any production build.
 *
 * The point is that the gaps stay visible while the site is being built. A
 * checklist in a document goes stale the moment someone fills a field; this
 * reads the actual content file, so it is always the current truth about what
 * is still missing before launch.
 */

import { useState } from "react";
import {
  about,
  brand,
  club,
  faq,
  product,
  reviews,
  services,
  trustFacts,
} from "@/content/site";

type Gap = { label: string; blocks: string };

function collect(): Gap[] {
  const gaps: Gap[] = [];
  const add = (value: unknown, label: string, blocks: string) => {
    if (value === null || value === undefined) gaps.push({ label, blocks });
  };

  add(brand.fullName, "Прізвище / повне ім'я", "Секція «Про», SEO title");
  add(brand.city, "Місто", "SEO title");
  add(brand.telegramUrl, "Telegram-посилання", "FAQ CTA, футер, fallback форми");
  add(brand.email, "Email", "Футер");
  add(brand.responseTime, "Час відповіді на заявку", "Мікрокопі форми + FAQ #8");
  add(brand.address, "Адреса клубу", "Секція «Атмосфера», футер");
  add(brand.legalEntity, "Реквізити ФОП", "Футер, /offer");

  // The hero no longer waits on anything: it was rebuilt to need no
  // photograph and no price, so both of its former blockers are gone.

  add(about.story, "Історія Анастасії", "Секція «Про»");
  add(about.credentials, "Освіта / сертифікати", "Секція «Про»");
  add(about.portrait, "Портрет", "Секція «Про»");

  const noPrice = services.filter((s) => s.priceFromAmount === null).length;
  if (noPrice > 0) {
    gaps.push({
      label: `Ціни послуг (${noPrice} з ${services.length})`,
      blocks: "Акордеон послуг",
    });
  }

  add(product.priceAmount, "Ціна програми харчування", "Тизер + /program + оплата");
  add(product.deliveryAssetRef, "Що саме видається покупцю", "/thank-you-order");
  add(product.deliveryHours, "Час ручної видачі", "/thank-you-order");

  if (club.photos.length === 0) gaps.push({ label: "Фото залу (6–10)", blocks: "Секція «Атмосфера»" });

  if (trustFacts.length < 2) {
    gaps.push({ label: "Підтверджені факти (мін. 2)", blocks: "Trust Strip не рендериться" });
  }

  const unanswered = faq.filter((item) => !item.answer).length;
  if (unanswered > 0) {
    gaps.push({
      label: `Відповіді на FAQ (${unanswered} з ${faq.length})`,
      blocks: unanswered === faq.length ? "Секція FAQ не рендериться" : "Частина питань прихована",
    });
  }

  const consented = reviews.filter((r) => r.consentOnFile).length;
  if (consented < 3) {
    gaps.push({
      label: `Відгуки зі згодою (${consented} з 3)`,
      blocks: consented === 0 ? "Секція «Результати» не рендериться" : "Спрощена версія секції",
    });
  }

  return gaps;
}

export function ContentGaps() {
  const [open, setOpen] = useState(false);
  if (process.env.NODE_ENV === "production") return null;

  const gaps = collect();
  if (gaps.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] max-w-[380px] font-[family-name:var(--font-mono)] text-[12px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ml-auto flex items-center gap-2 rounded-[var(--radius-card)] border border-orange bg-page px-4 py-2 text-accent-text"
      >
        {gaps.length} полів чекають на клієнтку
      </button>

      {open && (
        <ul className="mt-2 max-h-[60vh] overflow-y-auto rounded-[var(--radius-card)] border border-line bg-card p-4">
          {gaps.map((gap) => (
            <li key={gap.label} className="border-b border-line py-3 last:border-0">
              <p className="text-body">{gap.label}</p>
              <p className="mt-1 text-subtle">{gap.blocks}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
