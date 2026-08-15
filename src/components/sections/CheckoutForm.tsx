"use client";

/**
 * CHECKOUT — inline on /program, Stage 7 / Stage 2.
 *
 * Not a route. Not a modal. The form sits at the end of the page and hands off
 * to the bank's hosted payment page, which is the real checkout UI.
 *
 * The microcopy says out loud that an external page is coming ("Перейти до
 * оплати"). Hiding a redirect to a bank is how you lose people at the exact
 * moment they were about to pay.
 *
 * With no confirmed price the form does not render a disabled shell pretending
 * to be nearly ready. It says what is missing, because a price is not a
 * cosmetic gap.
 */

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Honeypot, Input } from "@/components/ui/Input";
import { brand, product } from "@/content/site";
import { track } from "@/lib/analytics";
import { readUtm } from "@/lib/cta";
import { IS_STATIC_DEMO } from "@/lib/env";
import { formatMoney } from "@/lib/format";

type Errors = Partial<Record<"name" | "email" | "contact" | "consent", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REQUIRED = "Без цього я не зможу надіслати доступ";

export function CheckoutForm() {
  const renderedAt = useRef(Date.now());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const price = formatMoney(product.priceAmount);

  // The preview build has no payment endpoint, and a checkout that looks live
  // but cannot take money is the one thing this page must never be.
  if (IS_STATIC_DEMO) {
    return (
      <div className="rounded-[var(--radius-card)] border border-orange/50 bg-orange/10 p-8">
        <p className="t-eyebrow text-accent-text">Демонстраційна версія</p>
        <p className="t-body mt-4 max-w-[46ch] text-body">
          Це прев'ю дизайну — оплата тут не працює. Щоб придбати програму,
          напиши мені в Instagram.
        </p>
        <div className="mt-5">
          <Button variant="secondary" href={brand.instagramUrl}>
            {brand.instagramHandle}
          </Button>
        </div>
      </div>
    );
  }

  if (!product.active || price === null) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line p-8">
        <p className="t-eyebrow text-accent-text">
          {product.active ? "Ціна ще не підтверджена" : "Тимчасово недоступно"}
        </p>
        <p className="t-body mt-4 max-w-[46ch] text-subtle">
          Купівля відкриється, щойно буде підтверджена вартість програми.
          Напиши мені, і я повідомлю, коли вона запрацює.
        </p>
      </div>
    );
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const next: Errors = {};
    if (name.trim().length < 2) next.name = REQUIRED;
    if (!EMAIL.test(email.trim())) next.email = "Перевір адресу пошти";
    if (contact.trim().length < 3) next.contact = REQUIRED;
    if (!consent) next.consent = "Постав галочку, щоб продовжити";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSending(true);
    setFailed(null);
    track({ name: "checkout_start" });

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          contact: contact.trim(),
          consent,
          renderedAt: renderedAt.current,
          website: (event.currentTarget.elements.namedItem("website") as HTMLInputElement)
            ?.value,
          ...readUtm(),
        }),
      });

      const json = (await res.json()) as { paymentUrl?: string };
      if (!res.ok || !json.paymentUrl) throw new Error("no_payment_url");
      window.location.href = json.paymentUrl;
    } catch {
      setFailed("Не вдалося створити рахунок. Спробуй ще раз.");
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-7">
      <Honeypot />

      <div className="flex items-baseline justify-between gap-6 border-b border-line pb-5">
        <span className="t-h3 text-strong">{product.name}</span>
        <span className="font-[family-name:var(--font-mono)] text-[17px] text-accent-text">
          {price}
        </span>
      </div>

      <Input
        label="Як до тебе звертатись"
        name="name"
        autoComplete="given-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />

      <Input
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        hint="Для чеку й дублювання доступу"
      />

      <Input
        label="@username або +380..."
        name="contact"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        error={errors.contact}
      />

      <div>
        <label className="flex cursor-pointer items-start gap-4">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 size-5 shrink-0 accent-[var(--color-orange)]"
          />
          <span className="t-body text-subtle">
            Погоджуюсь з{" "}
            <a href="/offer" className="text-body underline underline-offset-4">
              умовами покупки
            </a>{" "}
            та{" "}
            <a href="/privacy" className="text-body underline underline-offset-4">
              політикою конфіденційності
            </a>
          </span>
        </label>
        {errors.consent && (
          <p className="mt-2 text-[13px] text-error">{errors.consent}</p>
        )}
      </div>

      {failed && (
        <p role="alert" className="t-body text-error">
          {failed}
        </p>
      )}

      <Button type="submit" state={sending ? "loading" : "idle"} className="justify-self-start">
        {sending ? "Перенаправляю на оплату…" : "Перейти до оплати"}
      </Button>

      <p className="t-eyebrow normal-case tracking-[0.04em]">
        Оплата відбувається на захищеній сторінці банку.
      </p>
    </form>
  );
}
