---
target: critique (no target given) — the landing page
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-15T19-51-02Z
slug: src-app-page-tsx
---
⚠️ DEGRADED: single-context (user's CLAUDE.md forbids spawning sub-agents without an explicit request; treated as a standing decline)

Target: `src/app/page.tsx` → live build at crazy-fitness.kalynakate.workers.dev
Mode: Persuade — a landing page; the visitor's success is deciding and writing.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Step 2 never echoes what was chosen at step 1 |
| 2 | Match System / Real World | 4 | Copy speaks the reader's own words: "Соромно зайти в зал, де всі ніби знають, що роблять" |
| 3 | User Control and Freedom | 3 | "Назад" exists, but the hero-set goal can only be changed blind |
| 4 | Consistency and Standards | 2 | The same four goals are named differently in hero vs form |
| 5 | Error Prevention | 3 | Blur validation, format hint, consent gate, routes to first unanswered step |
| 6 | Recognition Rather Than Recall | 2 | User must remember their own choice; no prices to compare |
| 7 | Flexibility and Efficiency | 3 | Hero chips skip step 1 — a genuine designed accelerator |
| 8 | Aesthetic and Minimalist Design | 3 | Disciplined type; 9168px page with a 1105px empty club section |
| 9 | Error Recovery | 3 | Specific messages, input preserved, Instagram escape hatch |
| 10 | Help and Documentation | 1 | FAQ self-hid; the top question ("how much") has nowhere to be answered |
| **Total** | | **26/40** | **Acceptable — strong foundation, far from converting** |

## Design Specificity Verdict

**Unanchored assessment.** The site is NOT category-interchangeable, and the credit goes to two things rather than decoration. First, the copy is written for one person and one fear: "Починаєш у понеділок і зупиняєшся в середу", "Тренуєшся давно, а тіло не змінюється". That is not fitness-category text; it is text about a woman who has already tried. Second, the graduated-ruler motif. A gym measures: sets, weeks, kilograms. The motif repeats as a signature and every instance marks something real — a form step, a method stage. A decision, not an ornament.

The specificity weakness is the mirror image: **a site about a body and a place shows neither**. The section titled "Тут працюють, а не фотографуються" has zero photographs at 1105px tall. The headline promises what the page does not do.

**Deterministic scan.** `detect.mjs` — 1 finding, advisory:
- `codex-grid-background` at src/app/globals.css:367 — "decorative grid-line background".

This is a false positive by the detector's own rule, which exempts measurement surfaces. `.scale-rule` IS a measuring scale and it marks real things (form step, method stages) rather than filling space. Left unchanged.

**Overlays.** Not shown. No local server was started for critique and no script was injected, so no user-visible overlay exists and none is claimed.

**Method limitation, stated plainly.** The browser pane returned desktop screenshots at a broken scale — content occupied ~210px of an 800px canvas while the DOM reported h1 at 969px in a 1280 viewport. Mobile captures rendered correctly. Desktop conclusions therefore rest on DOM measurement and computed styles, not pixels.

## Overall Impression

Technical quality is markedly above average: **0 of 29 checked text/background pairs fail contrast**, focus rings are present throughout (1.6px, 2.4px offset), there is no horizontal overflow at 375px, and the form routes to the first unanswered question. Two "failures" I first found turned out to be my own measurement artifacts — my parser read `oklab()` numbers as RGB, and the large footer "C" sits inside `<p aria-hidden="true">`. Both withdrawn.

The biggest opportunity is not in the design but in what the design is forced to hide. No price. FAQ self-hidden. No photographs. The page is built impeccably politely around an emptiness — and every visitor must write in to learn the basics.

## What's Working

**The copy carries the weight.** "Впізнала себе?" with four pains instead of a service list is a diagnosis, not an advert. The reader recognises herself on the second screen and reads the rest as being about her.

**Hero chips as a funnel shortcut.** Clicking "Зрушити з плато" opens the form directly at step 2 with the goal captured — verified working. It removes one of three questions before the visitor realises she is filling a form.

**Form error handling.** The message names the specific problem and the format ("Схоже на помилку. Формат: @username або +380..."), input is not wiped, and there is a live escape hatch.

## Priority Issues

### [P1] Sticky CTA collides with the section CTA
Measured at 375px: the bar starts at y=727 while "Записатися на консультацію" occupies 693–745. The bar covers its lower **18px**, and two identical orange buttons sit 1px apart, reading as one broken blob.
**Why it matters:** the moment the visitor is ready to tap, she meets a visual defect and two identical buttons. That is a loss at the peak of intent.
**Cause:** StickyCta.tsx:26 observes only `#top` and `#zapys`; it knows nothing about the other CTAs on the page.
**Fix:** mark every primary CTA with an attribute and hide the bar when any of them is in viewport, not just the form section.
**Suggested command:** /impeccable adapt

### [P1] No price anywhere, and nothing to explain it
The FAQ is absent from the section list entirely — the content gate hid it. For a trainer's landing page this is the primary question, and there is not even a "depends on".
**Why it matters:** price is the main filter. Without it, either the indifferent write or nobody does; Anastasia spends her time disqualifying people in DMs instead of consulting.
**Fix:** at minimum a starting price, or an honest "we pick format and price at the consultation, which is free". The second is also an answer.
**Suggested command:** /impeccable clarify

### [P1] The Instagram grid argues against the positioning
Two of six posts are about training. The rest: a holiday with a child near mountains, a celebration with balloons, and a recipe infographic illegible at 160px. Next to it sits a section headlined "Тут працюють, а не фотографуються" with zero photographs.
**Why it matters:** the grid stands as social proof and proves the wrong thing. A woman embarrassed to walk into a gym is looking for evidence that people work here, and sees a personal album.
**Fix:** curate six frames about work and results, or keep three strong ones. Drop the recipe infographic — at 160px it is noise.
**Suggested command:** /impeccable distill

### [P2] Step 2 does not echo what step 1 captured
After clicking "Зрушити з плато" in the hero, the visitor lands on "Який формат?" with no mention of her choice. The only way to check is "Назад".
**Fix:** a compact chip above the question — "Мета: Зрушити з плато · змінити".
**Suggested command:** /impeccable clarify

### [P2] The same goals are named differently
Hero: "З нуля" / "Розібратись з їжею" / "Ще не знаю, з чого". Form: "Почати з нуля" / "Харчування" / "Інше". One concept, two vocabularies.
**Fix:** collapse to a single set of labels in src/content/site.ts.
**Suggested command:** /impeccable clarify

## Persona Red Flags

**Jordan (first-timer).** Reaches "Обери формат", opens "01 Персональні тренування" — no price. Looks for an FAQ — none. The only way to learn cost is to give up and DM. Half of these never write.

**Casey (phone, one hand, arriving from Instagram).** The primary scenario for this site. No horizontal scroll, actions in the bottom zone — good. Breaks on the two colliding CTAs. Also: "Програма харчування →" is **23px** tall against a 44px minimum — the only sub-minimum tap target on the page, and it leads to a separate paid page.

**Riley (stress tester).** Submits the form on the live site and gets a 502 because secrets are unset. The form says so honestly, offers Instagram, and preserves input — it holds up. But a retry will fail identically and the page does not warn about that.

**Oksana, 34, Lubny (derived from the site's own copy).** Recognised herself at "Соромно зайти в зал". Wants to see what it looks like inside and who Anastasia is — and sees no photograph of either the gym or the trainer. Trust is built on a face and a place; the page offers only words.

## Minor Observations

- h1 is 74px while two h2 are 72px. Hierarchy is nearly flat; the remaining h2 are 48px, so h2 has two sizes with no stated rule.
- All six Instagram images share the alt text "Допис в Instagram" — six identical announcements for a screen reader.
- Source images are 158–225px wide shown at 160 CSS px — soft on retina; portrait frames are cropped to square.
- The accordion button contains both title and description, so heading navigation reads a whole paragraph. The `<h3><button aria-expanded>` pattern itself is correct.
- The duplicated label in buttons (`RollingLabel`) is correctly `aria-hidden`; the accessible name is single. Verified.
- The content-gaps panel does not leak into production.

## Questions to Consider

- If every word were stripped and only the images left, would anything remain? Right now, no. Is that deliberate?
- The club section occupies 1105px and does not show the club. Does it earn that height, or should it disappear until photos exist — the way the FAQ did?
- Is the first consultation free? If so, it is the strongest argument on the page, and it appears nowhere.
