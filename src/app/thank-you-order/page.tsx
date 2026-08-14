import type { Metadata } from "next";
import Link from "next/link";
import { TrackView } from "@/components/TrackView";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { brand, product } from "@/content/site";

/**
 * /thank-you-order — after payment.
 *
 * On the MVP the product is delivered by hand (Stage 7), so the honest job of
 * this page is to say when it arrives and where from. Promising an instant
 * download that a person then has to send manually would be the one broken
 * promise a buyer definitely notices.
 */
export const metadata: Metadata = {
  title: "Дякую за покупку | Crazy Fitness",
  robots: { index: false, follow: true },
};

export default function ThankYouOrderPage() {
  return (
    <main className="grid min-h-svh place-items-center px-5 py-24">
      <TrackView
        event={{
          name: "purchase_complete",
          params: {
            value: (product.priceAmount ?? 0) / 100,
            currency: product.currency,
            product_id: product.slug,
          },
        }}
      />

      <div className="w-full max-w-[560px]">
        <Link
          href="/#top"
          aria-label="Crazy Fitness, на головну"
          className="-m-3 inline-flex p-3"
        >
          <Logo variant="monogram" />
        </Link>

        <h1 className="t-h1 mt-12 text-white">Оплата отримана</h1>

        <p className="t-body-l mt-8 text-muted">
          {product.deliveryHours
            ? `Надішлю ${product.name.toLowerCase()} протягом ${product.deliveryHours} год на пошту, яку ти вказала, і продублюю в Telegram.`
            : `Надішлю ${product.name.toLowerCase()} на пошту, яку ти вказала, і продублюю в Telegram.`}
        </p>

        <p className="t-body mt-6 text-muted">
          Не прийшло? Напиши мені, розберемось.
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
