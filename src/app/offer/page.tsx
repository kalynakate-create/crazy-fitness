import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { programPage } from "@/content/site";

export const metadata: Metadata = {
  title: "Публічна оферта | Crazy Fitness",
  robots: { index: true, follow: true },
};

/**
 * /offer
 *
 * Same rule as /privacy: the binding terms of a paid transaction are not
 * something to draft convincingly and hope nobody checks. Structure only, for
 * the lawyer to complete (Stage 24).
 *
 * The health disclaimer is the exception. It is shown in full here and on
 * /program because Opus 10.4 requires it to be visible before purchase, not
 * buried in a document. Its final wording still needs legal confirmation.
 */
const SECTIONS = [
  { title: "Сторони договору", note: "Реквізити ФОП і визначення покупця." },
  {
    title: "Предмет",
    note: "Що саме продається: цифровий продукт, склад, формат файлів, обсяг.",
  },
  { title: "Ціна та порядок оплати", note: "Вартість, валюта, платіжний провайдер." },
  {
    title: "Порядок передачі",
    note: "Строк ручної видачі після підтвердження оплати, канали передачі (email і Telegram).",
  },
  {
    title: "Повернення коштів",
    note:
      "Умови повернення для цифрового товару згідно із законодавством України. " +
      "Це найчутливіший пункт, потрібне формулювання юриста.",
  },
  { title: "Авторські права", note: "Заборона поширення й перепродажу матеріалів." },
  { title: "Відповідальність і межі гарантій", note: "Узгодити з дисклеймером про здоров'я." },
];

export default function OfferPage() {
  return (
    <>
      <Header />
      <main className="shell section pt-[calc(var(--header-h)+72px)]">
        <h1 className="t-h1 text-white">Публічна оферта</h1>

        <div className="mt-10 max-w-[70ch] rounded-[var(--radius-card)] border border-orange/40 bg-orange/5 p-6">
          <p className="t-eyebrow text-orange">Документ на погодженні</p>
          <p className="t-body mt-4 text-chalk">
            Текст оферти готує юрист. Нижче — структура з переліком того, що має
            бути врегульовано до першого продажу.
          </p>
        </div>

        <ol className="mt-14 border-t border-steel">
          {SECTIONS.map((section, index) => (
            <li key={section.title} className="border-b border-steel py-8">
              <div className="flex gap-6">
                <span className="font-[family-name:var(--font-mono)] text-[13px] text-orange">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="t-h3 text-white">{section.title}</h2>
                  <p className="t-body mt-3 max-w-[62ch] text-muted">{section.note}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-16 border-t border-steel pt-12">
          <h2 className="t-h3 text-white">Застереження щодо здоров'я</h2>
          <p className="t-body-l mt-5 max-w-[65ch] text-muted">
            {programPage.healthDisclaimer}
          </p>
        </section>

        <p className="t-body mt-12 text-muted">
          Обробка персональних даних —{" "}
          <Link href="/privacy" className="text-chalk underline underline-offset-4">
            політика конфіденційності
          </Link>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
