import type { Metadata } from "next";
import Link from "next/link";
import { TrackView } from "@/components/TrackView";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { brand, product } from "@/content/site";

/**
 * /thank-you-order — after a programme request.
 *
 * Not "after payment": there is no electronic payment, so nothing has been paid
 * at this point. The page's job is to say plainly what happens next, because
 * the one thing that would break trust here is implying a completed purchase
 * and then asking for money afterwards.
 */
export const metadata: Metadata = {
  title: "Заявку на програму прийнято | Crazy Fitness",
  robots: { index: false, follow: true },
};

export default function ThankYouOrderPage() {
  return (
    <main className="grid min-h-svh place-items-center px-5 py-24">
      {/* Reaching this page is a request, not a sale: no money has moved yet.
          Reporting it as a purchase would inflate revenue in GA4 and teach the
          Meta pixel to optimise for a conversion that has not happened. */}
      <TrackView
        event={{
          name: "order_request_submitted",
          params: { product_id: product.slug },
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

        <h1 className="t-h1 mt-12 text-strong">Заявку прийнято</h1>

        <p className="t-body-l mt-8 text-subtle">
          Напишу тобі особисто, домовимось про оплату, і після неї надішлю{" "}
          {product.name.toLowerCase()} на пошту, яку ти вказала, та продублюю в
          Telegram.
        </p>

        <p className="t-body mt-6 text-subtle">
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
