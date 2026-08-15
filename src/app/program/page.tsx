import type { Metadata } from "next";
import { CheckoutForm } from "@/components/sections/CheckoutForm";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { TrackView } from "@/components/TrackView";
import { Figure } from "@/components/ui/Figure";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { product, programPage } from "@/content/site";
import { priceLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: `${product.name} | Crazy Fitness`,
  description:
    "Принципи харчування, за якими ти складаєш меню сама. Без заборонених списків і без плану на сім днів.",
};

/**
 * /program — Stage 7.
 *
 * A separate route rather than another section on the homepage: it is a
 * different intent, it needs its own metadata and share card, and it is the
 * link that goes in ads.
 *
 * The price appears in the hero and again above the form. Hiding it until
 * checkout is how you train people to distrust a page.
 */
export default function ProgramPage() {
  return (
    <>
      <TrackView event={{ name: "product_view" }} />
      <Header />

      <main>
        {/* 1. Product hero */}
        <section className="section shell pt-[calc(var(--header-h)+72px)]">
          <div className="grid-site items-center gap-y-12">
            <Reveal className="col-span-4 md:col-span-8 lg:col-span-6">
              <p className="t-eyebrow">{product.eyebrow}</p>
              <h1 className="t-h1 mt-5 text-strong">{product.name}</h1>
              <ul className="mt-10 grid gap-3">
                {product.benefits.map((benefit) => (
                  <li key={benefit} className="t-body-l flex gap-4 text-body/85">
                    <span aria-hidden="true" className="mt-3 h-px w-5 shrink-0 bg-orange" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <p className="mt-10 font-[family-name:var(--font-mono)] text-[17px] text-accent-text">
                {priceLabel(product.priceAmount, "")}
              </p>
            </Reveal>

            <Reveal delay={90} className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-8">
              <Figure
                src={product.mockup}
                ratio="4 / 5"
                priority
                sizes="(min-width: 1200px) 40vw, 100vw"
                alt={product.name}
                placeholderNote="Мокап програми"
                className="rounded-[var(--radius-card)]"
              />
            </Reveal>
          </div>
        </section>

        {/* 2. What it actually is */}
        {programPage.what.body && (
          <section className="section shell border-t border-line">
            <SectionHeader heading={programPage.what.heading} />
            <p className="t-body-l mt-8 max-w-[65ch] text-subtle">
              {programPage.what.body}
            </p>
          </section>
        )}

        {/* 3. What is included */}
        {programPage.includes && programPage.includes.length > 0 && (
          <section className="section shell border-t border-line">
            <SectionHeader eyebrow="ЗМІСТ" heading="Що входить" />
            <ul className="mt-12 grid gap-px border-y border-line bg-line md:grid-cols-2">
              {programPage.includes.map((item) => (
                <li key={item} className="t-body bg-page p-7 text-body">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 4. Who it suits, and who it does not */}
        <section className="section shell border-t border-line">
          <SectionHeader eyebrow="ЧЕСНО" heading="Кому підходить, а кому ні" />
          <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <p className="t-eyebrow mb-6 text-success">Підходить</p>
              <ul className="grid gap-4">
                {programPage.suits.map((item) => (
                  <li key={item} className="t-body flex gap-4 text-body">
                    <span aria-hidden="true" className="mt-2.5 h-px w-5 shrink-0 bg-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="t-eyebrow mb-6 text-subtle">Не підходить</p>
              <ul className="grid gap-4">
                {programPage.notSuits.map((item) => (
                  <li key={item} className="t-body flex gap-4 text-subtle">
                    <span aria-hidden="true" className="mt-2.5 h-px w-5 shrink-0 bg-line" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Real spreads. Never a mocked-up screenshot. */}
        {programPage.spreads.length > 0 && (
          <section className="section border-t border-line">
            <div className="shell">
              <SectionHeader eyebrow="ЗСЕРЕДИНИ" heading="Як це виглядає" />
            </div>
            <div className="drag-row mt-12 gap-4 px-5 md:gap-5 md:px-10 lg:px-20">
              {programPage.spreads.map((src, index) => (
                <Figure
                  key={src}
                  src={src}
                  ratio="4 / 3"
                  sizes="(min-width: 1200px) 40vw, 80vw"
                  alt={`Розворот ${index + 1}`}
                  className="w-[80vw] rounded-[var(--radius-card)] md:w-[46vw] lg:w-[38vw]"
                />
              ))}
            </div>
          </section>
        )}

        {/* 6. How it works + inline checkout */}
        <section id="kupyty" className="section border-t border-line bg-raised">
          <div className="shell">
            <div className="grid-site gap-y-14">
              <div className="col-span-4 md:col-span-8 lg:col-span-5">
                <SectionHeader eyebrow="ЯК ЦЕ ПРАЦЮЄ" heading="Чотири кроки" />
                <ol className="mt-10 grid gap-6">
                  {programPage.how.map((step, index) => (
                    <li key={step} className="flex gap-5">
                      <span className="font-[family-name:var(--font-mono)] text-[13px] text-accent-text">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="t-body text-body/85">{step}</span>
                    </li>
                  ))}
                </ol>

                <p className="t-body mt-12 max-w-[52ch] border-t border-line pt-8 text-subtle">
                  {programPage.healthDisclaimer}
                </p>
              </div>

              <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
                <CheckoutForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
