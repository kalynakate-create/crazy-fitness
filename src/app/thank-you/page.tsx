import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { brand } from "@/content/site";

/**
 * /thank-you — after a consultation request.
 *
 * Separate from /thank-you-order because the two say genuinely different
 * things: this one sets an expectation about a reply, that one delivers a
 * product. One shared page would have to hedge and would do neither well.
 *
 * noindex via metadata rather than robots.txt: for a URL that may already be
 * indexed, only the meta tag actually removes it. Stage 22.
 */
export const metadata: Metadata = {
  title: "Заявку прийнято | Crazy Fitness",
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return (
    <main className="grid min-h-svh place-items-center px-5 py-24">
      <div className="w-full max-w-[560px]">
        <Link
          href="/#top"
          aria-label="Crazy Fitness, на головну"
          className="-m-3 inline-flex p-3"
        >
          <Logo variant="monogram" />
        </Link>

        <h1 className="t-h1 mt-12 text-strong">Заявку прийнято</h1>

        <p className="t-body-l mt-8 text-subtle">
          {brand.responseTime
            ? `Відповім особисто протягом ${brand.responseTime}.`
            : "Відповім особисто, щойно побачу заявку."}{" "}
          Якщо зручніше — можеш написати першою.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-6">
          {brand.telegramUrl && (
            <Button href={brand.telegramUrl}>Написати в Telegram</Button>
          )}
          <Button variant="ghost" href="/#top">
            На головну
          </Button>
        </div>

        <div className="scale-rule mt-16 opacity-60" aria-hidden="true" />
      </div>
    </main>
  );
}
