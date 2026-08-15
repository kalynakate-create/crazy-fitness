"use client";

/**
 * 12 LEAD FORM — Stage 8 / Stage 9 / Stage 20.
 *
 * Three steps, inline at #zapys, never a modal and never its own route: this is
 * the highest-intent moment in the funnel and Stage 2 rules out spending a page
 * load on it.
 *
 * Three steps rather than one long form is a fixed MVP decision. The formal A/B
 * test is off the launch scope (Stage 8): there is neither the traffic nor the
 * tooling for a significant result, so we read the step-completion funnel
 * instead and fix whichever step actually loses people.
 *
 * Steps 1 and 2 are pre-filled when the visitor has already answered them by
 * clicking a specific service, so nobody is asked the same question twice.
 *
 * Spam protection is invisible on purpose (Stage 9): honeypot, submit-timing,
 * and a server-side rate limit. No captcha at launch. A visible challenge here
 * would add friction to solve a problem the site does not have yet.
 */

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Honeypot, Input, Textarea } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import { brand, leadForm } from "@/content/site";
import { track } from "@/lib/analytics";
import { getCtaContext, readUtm, subscribeCta } from "@/lib/cta";
import { IS_STATIC_DEMO } from "@/lib/env";
import { detectContactType, type LeadFormat, type LeadGoal } from "@/lib/types";
import { useOnceInView } from "@/lib/use-once-in-view";

type Errors = Partial<Record<"name" | "contact" | "consent", string>>;

const REQUIRED = "Без цього я не зможу тобі відповісти";

export function LeadForm() {
  const router = useRouter();
  const renderedAt = useRef(Date.now());

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [goal, setGoal] = useState<LeadGoal | null>(null);
  const [format, setFormat] = useState<LeadFormat | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [consent, setConsent] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [demo, setDemo] = useState(false);

  const viewRef = useOnceInView<HTMLDivElement>(
    () =>
      track({
        name: "consultation_open",
        params: { source_section: getCtaContext().sourceSection },
      }),
    0.3,
  );

  /**
   * Answers mirrored into refs so routing can read them synchronously, without
   * waiting for a re-render.
   *
   * This exists because of a real bug: a service CTA pre-fills the format and
   * used to jump straight to step 3, leaving the goal unanswered. Submit is
   * guarded on both, so the button did nothing at all — no request, no error,
   * no feedback — on the highest-intent path on the site.
   *
   * Routing now always lands on the first *unanswered* question, and submit
   * sends you back to whatever is missing rather than failing silently.
   */
  const goalRef = useRef<LeadGoal | null>(null);
  const formatRef = useRef<LeadFormat | null>(null);

  const route = () => {
    if (!goalRef.current) return setStep(1);
    if (!formatRef.current) return setStep(2);
    setStep(3);
  };

  const applyGoal = (value: LeadGoal) => {
    goalRef.current = value;
    setGoal(value);
  };

  const applyFormat = (value: LeadFormat) => {
    formatRef.current = value;
    setFormat(value);
  };

  /* A CTA elsewhere on the page can answer step 1 or 2 for the visitor. */
  useEffect(() => {
    const apply = (ctx: ReturnType<typeof getCtaContext>) => {
      if (!ctx.format && !ctx.goal) return;
      if (ctx.goal) applyGoal(ctx.goal);
      if (ctx.format) applyFormat(ctx.format);
      route();
    };
    apply(getCtaContext());
    return subscribeCta(apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chooseGoal = (value: LeadGoal) => {
    applyGoal(value);
    track({ name: "consultation_step_complete", params: { step: 1 } });
    route();
  };

  const chooseFormat = (value: LeadFormat) => {
    applyFormat(value);
    track({ name: "consultation_step_complete", params: { step: 2 } });
    route();
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = REQUIRED;
    if (!contact.trim()) next.contact = REQUIRED;
    else if (!detectContactType(contact)) {
      next.contact = "Схоже на помилку. Формат: @username або +380...";
    }
    if (!consent) next.consent = "Постав галочку, щоб я могла тобі написати";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // A missing answer sends the visitor to that question. It must never be
    // possible for this button to do nothing.
    if (!goal || !format) {
      route();
      return;
    }

    if (!validate()) return;

    // No server behind the preview build. Say so rather than 404 the submit.
    if (IS_STATIC_DEMO) {
      setDemo(true);
      return;
    }

    setSending(true);
    setFailed(false);

    const payload = {
      goal,
      format,
      name: name.trim(),
      contact: contact.trim(),
      note: note.trim() || undefined,
      consent,
      sourceSection: getCtaContext().sourceSection,
      renderedAt: renderedAt.current,
      website: (event.currentTarget.elements.namedItem("website") as HTMLInputElement)
        ?.value,
      ...readUtm(),
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));

      track({ name: "consultation_step_complete", params: { step: 3 } });
      track({ name: "consultation_submit", params: { goal, format } });
      router.push("/thank-you");
    } catch {
      setFailed(true);
      setSending(false);
    }
  };

  return (
    <section id="zapys" aria-labelledby="zapys-h" className="section bg-raised">
      <div className="shell" ref={viewRef}>
        <div className="grid-site gap-y-12">
          <Reveal className="col-span-4 md:col-span-8 lg:col-span-5">
            <p className="t-eyebrow">{leadForm.eyebrow}</p>
            <h2 id="zapys-h" className="t-h2 mt-5 text-strong">
              {leadForm.heading}
            </h2>

            {brand.responseTime && (
              <p className="t-body-l mt-8 max-w-[36ch] text-subtle">
                Відповім особисто в Telegram протягом {brand.responseTime}.
              </p>
            )}

            {/* Step position on the measuring rule, not a progress bar. */}
            <div className="mt-12 flex items-end gap-2" aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className={`h-8 w-px transition-colors duration-300 ${
                    n <= step ? "bg-orange" : "bg-line"
                  } ${n === step ? "h-12" : ""}`}
                />
              ))}
              <span className="ml-4 font-[family-name:var(--font-mono)] text-[13px] text-subtle">
                крок {step} з 3
              </span>
            </div>
          </Reveal>

          <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
            <form onSubmit={submit} noValidate>
              <Honeypot />

              {step === 1 && (
                <fieldset>
                  <legend className="t-h3 mb-8 text-strong">З чим ти прийшла?</legend>
                  <div className="grid gap-3 md:grid-cols-2">
                    {leadForm.goals.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => chooseGoal(option.value)}
                        className={`min-h-[52px] rounded-[var(--radius-card)] border px-6 py-4 text-left transition-colors ${
                          goal === option.value
                            ? "border-orange bg-orange/10 text-strong"
                            : "border-line text-body hover:border-subtle"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {step === 2 && (
                <fieldset>
                  <legend className="t-h3 mb-8 text-strong">Який формат?</legend>
                  <div className="grid gap-3 md:grid-cols-2">
                    {leadForm.formats.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => chooseFormat(option.value)}
                        className={`min-h-[52px] rounded-[var(--radius-card)] border px-6 py-4 text-left transition-colors ${
                          format === option.value
                            ? "border-orange bg-orange/10 text-strong"
                            : "border-line text-body hover:border-subtle"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="t-body mt-8 text-subtle underline underline-offset-4 hover:text-body"
                  >
                    Назад
                  </button>
                </fieldset>
              )}

              {step === 3 && (
                <fieldset className="grid gap-7">
                  <legend className="t-h3 mb-8 text-strong">Куди тобі відповісти?</legend>

                  <Input
                    label="Як до тебе звертатись"
                    name="name"
                    autoComplete="given-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => name.trim().length >= 2 && setErrors((p) => ({ ...p, name: undefined }))}
                    error={errors.name}
                  />

                  <Input
                    label="@username або +380..."
                    name="contact"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    onBlur={() =>
                      detectContactType(contact) &&
                      setErrors((p) => ({ ...p, contact: undefined }))
                    }
                    error={errors.contact}
                    hint="Telegram або телефон, як зручніше"
                  />

                  {noteOpen ? (
                    <Textarea
                      label="Що хочеш додати?"
                      name="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setNoteOpen(true)}
                      className="t-body justify-self-start text-subtle underline underline-offset-4 hover:text-body"
                    >
                      Додати коментар
                    </button>
                  )}

                  <div>
                    <label className="flex cursor-pointer items-start gap-4">
                      <input
                        type="checkbox"
                        name="consent"
                        checked={consent}
                        onChange={(e) => {
                          setConsent(e.target.checked);
                          if (e.target.checked) setErrors((p) => ({ ...p, consent: undefined }));
                        }}
                        className="mt-1 size-5 shrink-0 accent-[var(--color-orange)]"
                        aria-describedby={errors.consent ? "consent-error" : undefined}
                      />
                      <span className="t-body text-subtle">
                        Погоджуюсь на обробку моїх даних згідно з{" "}
                        <a
                          href="/privacy"
                          className="text-body underline underline-offset-4"
                        >
                          політикою конфіденційності
                        </a>
                      </span>
                    </label>
                    {errors.consent && (
                      <p id="consent-error" className="mt-2 text-[13px] text-error">
                        {errors.consent}
                      </p>
                    )}
                  </div>

                  {demo && (
                    <div
                      role="status"
                      className="rounded-[var(--radius-card)] border border-orange/50 bg-orange/10 p-5"
                    >
                      <p className="t-body text-body">
                        Це демонстраційна версія сайту — заявки тут не
                        надсилаються. Напиши мені в Instagram, і я відповім.
                      </p>
                      <div className="mt-4">
                        <Button variant="ghost" href={brand.instagramUrl}>
                          {brand.instagramHandle} →
                        </Button>
                      </div>
                    </div>
                  )}

                  {failed && (
                    <div
                      role="alert"
                      className="rounded-[var(--radius-card)] border border-error/50 bg-error/10 p-5"
                    >
                      <p className="t-body text-body">
                        Заявка не відправилась. Спробуй ще раз
                        {brand.telegramUrl ? " або напиши мені напряму." : "."}
                      </p>
                      {brand.telegramUrl && (
                        <div className="mt-4">
                          <Button
                            variant="ghost"
                            href={brand.telegramUrl}
                            onClick={() =>
                              track({ name: "consultation_telegram_fallback_click" })
                            }
                          >
                            Написати в Telegram →
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-6">
                    <Button
                      type="submit"
                      state={sending ? "loading" : "idle"}
                      className="min-w-[220px]"
                    >
                      {sending ? "Надсилаю…" : "Залишити заявку"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="t-body text-subtle underline underline-offset-4 hover:text-body"
                    >
                      Назад
                    </button>
                  </div>
                </fieldset>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
