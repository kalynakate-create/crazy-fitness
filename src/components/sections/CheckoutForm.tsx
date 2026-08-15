"use client";

/**
 * PROGRAMME REQUEST — inline on /program, Stage 7 with the payment removed.
 *
 * Not a route. Not a modal. There is no electronic payment: this takes the
 * request, Anastasia settles and delivers directly. So the form no longer
 * pretends to be a checkout, and the microcopy says what actually happens next
 * rather than promising a payment page that does not exist.
 *
 * A missing price no longer blocks it either. With manual settlement the amount
 * can be agreed in the conversation, so the page can take a request while the
 * price is still being decided.
 */

import { useRouter } from "next/navigation";
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
  const router = useRouter();
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

  if (!product.active) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line p-8">
        <p className="t-eyebrow text-accent-text">Тимчасово недоступно</p>
        <p className="t-body mt-4 max-w-[46ch] text-subtle">
          Напиши мені, і я повідомлю, щойно програма знову буде доступна.
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
          elapsedMs: Date.now() - renderedAt.current,
          website: (event.currentTarget.elements.namedItem("website") as HTMLInputElement)
            ?.value,
          ...readUtm(),
        }),
      });

      if (!res.ok) throw new Error(String(res.status));
      router.push("/thank-you-order");
    } catch {
      setFailed("Заявка не відправилась. Спробуй ще раз.");
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-7">
      <Honeypot />

      <div className="flex items-baseline justify-between gap-6 border-b border-line pb-5">
        <span className="t-h3 text-strong">{product.name}</span>
        {price && (
          <span className="font-[family-name:var(--font-mono)] text-[17px] text-accent-text">
            {price}
          </span>
        )}
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
        {sending ? "Надсилаю…" : "Хочу програму"}
      </Button>

      <p className="t-eyebrow normal-case tracking-[0.04em]">
        Напишу тобі особисто, домовимось про оплату і надішлю програму.
      </p>
    </form>
  );
}
