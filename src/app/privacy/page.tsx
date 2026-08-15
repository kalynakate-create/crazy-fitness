import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";

export const metadata: Metadata = {
  title: "Політика конфіденційності | Crazy Fitness",
  robots: { index: true, follow: true },
};

/**
 * /privacy
 *
 * Deliberately NOT filled with plausible-sounding legal text. This document
 * governs how a real person's contact details and payment data are handled, and
 * inventing its wording would be worse than leaving it visibly unfinished:
 * a placeholder that reads like a policy is the kind of thing that ships by
 * accident.
 *
 * Stage 24 lists legal review of /privacy and /offer as required before
 * development is complete. What follows is the structure the lawyer fills, with
 * the specifics this implementation actually needs them to cover.
 */
const SECTIONS = [
  {
    title: "Хто збирає дані",
    note: "Повне найменування ФОП, реєстраційні дані, контакти для звернень.",
  },
  {
    title: "Які дані ми збираємо",
    note:
      "Форма заявки: ім'я, Telegram або телефон, коментар, час згоди. " +
      "Форма покупки: додатково email. Автоматично: UTM-мітки, розділ сайту, з якого надійшла заявка.",
  },
  {
    title: "Навіщо",
    note:
      "Відповідь на заявку, надання послуги, видача цифрового продукту, " +
      "бухгалтерський облік продажів.",
  },
  {
    title: "Де зберігаються дані",
    note:
      "Google Sheets (обліковий запис власниці), Telegram (сповіщення про заявку), " +
      "хостинг Vercel. Вказати юрисдикції та строк зберігання.",
  },
  {
    title: "Аналітика та файли cookie",
    note:
      "Google Analytics 4 і Meta Pixel вмикаються лише після натискання «Прийняти» " +
      "у банері згоди. Описати, які саме ідентифікатори збираються та як відкликати згоду.",
  },
  {
    title: "Платіжні дані",
    note:
      "Оплата відбувається на стороні банку. Сайт не отримує й не зберігає " +
      "реквізити карток. Вказати платіжного провайдера.",
  },
  {
    title: "Права користувача",
    note:
      "Доступ, виправлення, видалення, відкликання згоди. Вказати канал звернення " +
      "та строк реакції.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="shell section pt-[calc(var(--header-h)+72px)]">
        <h1 className="t-h1 text-strong">Політика конфіденційності</h1>

        <div className="mt-10 max-w-[70ch] rounded-[var(--radius-card)] border border-orange/40 bg-orange/5 p-6">
          <p className="t-eyebrow text-accent-text">Документ на погодженні</p>
          <p className="t-body mt-4 text-body">
            Текст політики готує юрист. Нижче — перелік пунктів, які має покривати
            документ, виходячи з того, що сайт справді збирає й куди передає.
          </p>
        </div>

        <ol className="mt-14 border-t border-line">
          {SECTIONS.map((section, index) => (
            <li key={section.title} className="border-b border-line py-8">
              <div className="flex gap-6">
                <span className="font-[family-name:var(--font-mono)] text-[13px] text-accent-text">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="t-h3 text-strong">{section.title}</h2>
                  <p className="t-body mt-3 max-w-[62ch] text-subtle">{section.note}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <p className="t-body mt-12 text-subtle">
          Умови покупки цифрового продукту —{" "}
          <Link href="/offer" className="text-body underline underline-offset-4">
            публічна оферта
          </Link>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
