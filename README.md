# Crazy Fitness

Implementation of `crazy-fitness-master-blueprint.md`. Stage 28 of that document
is the source of truth; where this code and the blueprint disagree, the
blueprint wins and the code is wrong.

**Design preview:** https://kalynakate-create.github.io/crazy-fitness/

That URL is for looking at and showing the client. It is **not** the product.
GitHub Pages serves files and nothing else, so the lead form and the checkout
have no endpoint there and say so rather than failing at the submit button. The
real deployment is Vercel, per Stage 18, which is what makes `/api/lead` and
`/api/order` exist at all.

Redeploy the preview after a change:

```bash
pwsh -File scripts/deploy-preview.ps1
```

Pages serves the preview from the `gh-pages` branch rather than from Actions.
`.github/workflows/deploy-pages.yml` is written and locally verified but not
committed: pushing anything under `.github/workflows/` requires the `workflow`
OAuth scope, and the branch route needs only `repo`. Grant that scope and the
workflow can replace the script.

Node is not installed system-wide on the machine this was built on. It lives at
`F:\dev\node-v24.19.0-win-x64`, so put it on PATH first:

```bash
$env:Path = 'F:\dev\node-v24.19.0-win-x64;' + $env:Path; npm run dev
```

The project lives on `F:` because `C:` was full to the byte when this was
built. That is resolved — the Downloads folder was relocated to `F:\Downloads`
(registry known-folder redirect, so browsers save there too), which returned
~8.8 GB and let the pagefile grow again. A clean build now takes ~44s with no
heap cap. The source blueprint is at `F:\Downloads\crazy-fitness-master-blueprint.md`.

`npm run build` for production, `npm run typecheck` for types only.

## The one rule that matters

Unconfirmed facts are `null` in `src/content/site.ts`, and components are
written to handle `null` by hiding the atom, the section, or the block.

**Never replace a `null` with a plausible value.** Not a price, not a number of
clients, not a response time, not a testimonial. Opus Part 1.4 and Stage 24
treat invented figures as out of bounds, and the code enforces that rather than
trusting whoever edits the file next. A gap that ships is fine. An invented
number that ships is not.

Run `npm run dev` and the **content gaps panel** appears bottom-right: a live
version of the Stage 24 checklist, read from the actual content file. It is
development-only and never renders in production.

### Sections that hide themselves

| Section | Threshold | Below it |
|---|---|---|
| Trust Strip | 2+ confirmed facts | not rendered |
| Reviews | 3+ with written consent | 1–2 renders one large quote; 0 not rendered |
| FAQ | 1+ answered question | unanswered questions filtered out; 0 hides the section |
| Checkout | a confirmed price | form replaced with an explanation |

The site can launch without any of them (Stage 28, "Launch gate").

## Layout

```
src/content/site.ts        all copy and content. The only file a non-developer edits.
src/app/globals.css        design tokens, Stage 12–13. No hex belongs anywhere else.
src/components/ui/         primitives: Button, Input, Accordion, Figure, ScaleDivider
src/components/sections/   the 13 homepage sections, one file each
src/app/api/               /api/lead and /api/order
src/lib/                   types (Stage 19), analytics, spam, Telegram, Sheets
```

## Decisions worth knowing

**GSAP is used sparingly.** Only where it earns its place: the hero load
sequence, the method progress line (ScrollTrigger), magnetic buttons. Ordinary
scroll reveals use IntersectionObserver, because Opus 9.5 rejects dragging in a
library for three reveals and that reasoning does not stop at Framer Motion.
Draggable was dropped: the galleries use native `scroll-snap`, per Stage 14.

**Tailwind v4, not v3.** Tokens live in `@theme` inside `globals.css` rather
than `tailwind.config.ts`. Same intent as Stage 18 — one source of truth in
code — using the current version's mechanism.

**Leads are never lost.** `/api/lead` writes to Sheets and notifies Telegram in
parallel and succeeds if either works. Only when both fail does it return an
error, which is what makes the form show its Telegram fallback instead of
quietly swallowing a submission.

**Money is integer kopiykas** everywhere, never a float, and the order amount is
read server-side from the content file rather than from the request body.

**Spam protection is invisible**: honeypot, submit timing, rate limit. No
captcha at launch. The limiter uses two buckets, and the split is not
incidental: most traffic is mobile, on Ukrainian carriers that put many
subscribers behind one address, so a single counter charged on rejected
submissions would let five mistyped phone numbers lock out the sixth woman
sharing that IP. A loose `request` ceiling (30/h) catches hammering; the tight
`submit` ceiling (5/h) is only charged once a submission is well-formed. Note
both live in one serverless instance's memory, so they raise the cost of abuse
rather than eliminating it.

## Placeholders to replace

- **Logo.** `src/components/ui/Logo.tsx` renders type, not the real mark. The
  vector is a Stage 24 requirement, and the four rasters we have show the logo
  on white and orange only, never on `ink` — its contrast on the actual page
  background is still unverified.
- **Favicon.** `public/favicon.svg` is a stand-in for the CF monogram.
- **`/privacy` and `/offer`** are structured checklists, not legal text. They
  govern real contact and payment data and need a lawyer, not a draft that
  reads convincingly.
- **Every photo.** `Figure` renders a composed plate wherever a photo is
  missing, so the site looks deliberate rather than broken while the shoot is
  outstanding.

## Verified

Exercised against a running production build, not read off the source.

- Build passes; 128 kB first load on the homepage.
- Zero WCAG AA contrast failures on `/` and `/program`, measured by
  compositing every text node against its real background through a canvas, so
  `oklab()` values and alpha layers resolve correctly.
- No horizontal overflow at 375 / 768 / 1440. Hero is exactly 100svh; H1 lands
  on the 44 / 72 / 120 px steps the type scale specifies.
- 14/14 API cases: honeypot and sub-2s submits silently accepted, six
  validation rejections, `@handle` / `+380` / `0XX` contacts all parsed, both
  rate-limit buckets behaving, checkout refusing to sell without a price.
- Lead form driven end to end: step routing, per-field errors, prefill from a
  service CTA, and a real request carrying the right `goal` / `format` /
  `sourceSection`.
- Keyboard focus ring renders (2px orange, offset) under real Tab navigation.
- Mobile menu opens, locks scroll, closes on Escape and restores scroll.
- Floating label animates on `translate`/`scale` only; `font-size` never moves.
- `prefers-reduced-motion` block ships with 6 rules including the global
  duration override.
- Every route opened and audited, not just the homepage: `/program`,
  `/thank-you`, `/thank-you-order`, `/privacy`, `/offer` and a 404. One `<h1>`
  each, no overflow, no contrast failures, `noindex` where it belongs.
- Tablet breakpoint matches Stage 13 exactly: 8 columns, 20px gutter, 40px
  margin, `.t-h2` at 36px, header 65px with the burger swapped in.
- Stage 21 budget: 227 KB on first load against a 1 MB ceiling (170 KB of that
  is the three Cyrillic font families), LCP 180ms.

Two caveats on those numbers. LCP was measured with no photographs in place;
it will rise once real images land, which is what the 250 KB hero budget is
for. And the font payload is the largest single cost — worth re-checking if a
fourth family is ever added.

### Bugs this found that reading the code did not

1. **Dead submit button.** Arriving from a service CTA pre-filled the format and
   jumped to step 3, leaving the goal unanswered — and submit was guarded on
   both. Valid data, consent ticked, click, and nothing happened at all. On the
   highest-intent path on the site.
2. **Consent banner covering the hero CTA** on mobile, for every first-time
   visitor.
3. **Rate limiter charging typos**, which on carrier-grade NAT would lock out
   real people.
4. Three contrast failures and a 22 px tap target on the header logo.

**Not yet tested:** the real Instagram in-app browser, which Stage 21 makes a
launch requirement and which cannot be faked in a desktop browser.
