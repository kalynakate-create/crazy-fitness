"use client";

/**
 * INPUT — Stage 9 states table / Stage 20.
 *
 * Bottom rule only, label rises out of the field on focus. The label is a real
 * <label>, never a placeholder doing double duty, so it survives once the field
 * has content.
 *
 * Errors sit under the field, wired through aria-describedby, and recolour the
 * rule rather than boxing the field in red. Opus 8.3 rules out the explosive
 * error frame.
 */

import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

type SharedProps = {
  label: string;
  error?: string | null;
  hint?: string;
};

type InputProps = SharedProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id">;

type TextareaProps = SharedProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "id">;

const FIELD =
  "peer w-full appearance-none border-0 border-b bg-transparent pb-3 pt-6 " +
  "text-chalk outline-none transition-colors placeholder:text-transparent " +
  "focus:border-b-2 focus:pb-[11px]";

/**
 * The label rises and shrinks using transform only.
 *
 * The obvious way to write this animates `top` and `font-size`, which are
 * layout properties: every keystroke's worth of focus change costs a reflow,
 * on the low-end Android hardware most of this traffic arrives on. Translating
 * and scaling from the top-left origin gives the identical result on the
 * compositor. scale-75 of the 16px base lands on exactly the 12px the type
 * scale calls for, and -translate-y-6 matches the old top-6 to top-0 move.
 *
 * Letter-spacing cannot be transformed, so it is set once rather than
 * animated; the scale change reads as the tracking shift anyway.
 *
 * The transition names `translate` and `scale`, not `transform`: Tailwind v4
 * compiles these utilities to the standalone transform properties, so a
 * transition on `transform` matches nothing and the label would jump instead
 * of gliding. Both are still composited, so the cost is the same.
 */
const LABEL =
  "pointer-events-none absolute left-0 top-6 origin-top-left text-muted " +
  "tracking-[0.06em] " +
  "transition-[translate,scale,color] duration-200 ease-[var(--ease-out-strong)] " +
  "peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-orange " +
  "peer-[:not(:placeholder-shown)]:-translate-y-6 " +
  "peer-[:not(:placeholder-shown)]:scale-75";

export function Input({ label, error, hint, ...rest }: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="relative pt-2">
      <input
        {...rest}
        id={id}
        placeholder=" "
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
          undefined
        }
        className={`${FIELD} ${
          error ? "border-error focus:border-error" : "border-steel focus:border-orange"
        }`}
      />
      <label htmlFor={id} className={`${LABEL} font-[family-name:var(--font-mono)]`}>
        {label}
      </label>
      {hint && !error && (
        <p id={hintId} className="mt-2 text-[13px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-2 text-[13px] text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function Textarea({ label, error, hint, ...rest }: TextareaProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="relative pt-2">
      <textarea
        {...rest}
        id={id}
        placeholder=" "
        rows={rest.rows ?? 3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${FIELD} resize-none ${
          error ? "border-error focus:border-error" : "border-steel focus:border-orange"
        }`}
      />
      <label htmlFor={id} className={`${LABEL} font-[family-name:var(--font-mono)]`}>
        {label}
      </label>
      {error && (
        <p id={errorId} className="mt-2 text-[13px] text-error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Hidden from people, visible to bots. Stage 9. */
export function Honeypot({ name = "website" }: { name?: string }) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
      <label htmlFor={`${name}-hp`}>Не заповнюй це поле</label>
      <input id={`${name}-hp`} name={name} type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
