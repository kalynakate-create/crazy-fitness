/**
 * SINGLE SOURCE OF CONTENT.
 *
 * Two rules, both inherited from the blueprint and both non-negotiable
 * (Opus Part 1.4 / 6.2 §09 / 10.4, restated in Stage 24):
 *
 *   1. `null` means [CLIENT DATA REQUIRED]. It is a real fact that Anastasia
 *      has not confirmed yet. Never replace a `null` with a plausible number,
 *      price, testimonial or timeframe. Components are written to handle
 *      `null` by hiding the atom, the section, or the whole block. A site
 *      that ships with a gap is fine. A site that ships with an invented
 *      figure is not.
 *
 *   2. Strings that are present are COPY DIRECTION (Stage 5), not approved
 *      copy. They describe format and process, never results, timeframes or
 *      outcomes. The copywriting pass replaces them; nothing here claims a
 *      result on Anastasia's behalf.
 *
 * Run the site in development to see `ContentGaps`, a live version of the
 * Stage 24 checklist listing every remaining `null`.
 */

import type { LeadFormat, LeadGoal, SourceSection } from "@/lib/types";

/* ========================================================================== */
/* BRAND                                                                      */
/* ========================================================================== */

/**
 * INSTAGRAM AUDIT — Stage 24, "REQUIRED BEFORE DESIGN".
 *
 * Read from the two public profiles on 15 Aug 2026. Everything sourced that way
 * is marked `[IG]` below. These are Anastasia's own public statements about
 * herself, which is good evidence but is not the same as her approving the
 * wording for her own website: treat `[IG]` as "confirm at the copy review",
 * not as settled.
 *
 * @crazy_fitness_t.a  — "Анастасія | Тренер | Нутриціолог", 7,049 followers
 *   "10 років створюю сильних і впевнених дівчат завдяки фітнесу і авторській
 *    програмі схуднення", "Вища освіта", "Засновниця @crazy_fitness__club"
 *
 * @crazy_fitness__club — "Спортзал фітнес клуб", 2,653 followers
 *   "Силовий фітнес/Джампінг/TRX/BFB/Функціональні тренування", "місто Лубни"
 *
 * Not obtainable this way, and still blocking: prices, response time, surname,
 * club address, ФОП details, FAQ answers, and every photograph.
 */
export const brand = {
  name: "Crazy Fitness",
  byline: "by Anastasia",

  /** First name is a fact: the wordmark itself reads "BY ANASTASIA". */
  ownerName: "Анастасія",

  /** Confirmed by the client. Used in the About H2 and the SEO title. */
  fullName: "Анастасія Товкач",

  /** [IG] Stated on the club profile: "місто Лубни". Used in the SEO title. */
  city: "Лубни",

  /** Confirmed by the client. City appended from the [IG] fact above. */
  address: "вул. Ярослава Мудрого, 26, Лубни",

  /**
   * Logo files, in /public/logo/.
   *
   * `null` means the file is not there yet and the type-set placeholder is
   * used instead. Drop the real artwork in and set the path; nothing else
   * needs changing.
   *
   * `mark` is the CF monogram, used in the header and on the small pages.
   * `markLight` is the same mark in a version that survives the dark product
   * band; if it stays null the dark band falls back to the placeholder rather
   * than showing a dark logo on a dark ground.
   * `full` is the complete lockup with "CRAZY FITNESS BY ANASTASIA".
   *
   * SVG is strongly preferred: the header renders the mark at 22px and the
   * footer could use the lockup large, and one vector covers both without a
   * second export.
   */
  logo: {
    /**
     * Derived from the supplied artwork (IMG_0292.JPG, kept untouched beside
     * them): the CF monogram with the dumbbell on the F's stroke, wordmark
     * removed because it is illegible at the 26px the header renders, matted
     * onto transparency and recoloured to the site's own tokens.
     * Regenerate with scripts in the scratchpad if the source changes.
     */
    mark: "/logo/mark.png",
    markLight: "/logo/mark-light.png",
    full: null as string | null,
  },

  instagramHandle: "@crazy_fitness_t.a",
  instagramUrl: "https://instagram.com/crazy_fitness_t.a",

  /** [IG] The club keeps its own account, which is the better link for §08. */
  clubInstagramHandle: "@crazy_fitness__club",
  clubInstagramUrl: "https://instagram.com/crazy_fitness__club",

  /** Telegram deep link. Until set, every Telegram fallback stays hidden. */
  telegramUrl: null as string | null,

  email: null as string | null,

  /**
   * Stage 11 note: this exact value appears in the form microcopy AND in
   * FAQ #8. It is stored once so the two can never drift apart, which is the
   * failure the blueprint calls out by name.
   */
  responseTime: null as string | null,

  /** Sole-trader details for the footer and /offer. Stage 24. */
  legalEntity: null as string | null,
} as const;

/* ========================================================================== */
/* 01 HERO — Concept A "MANIFEST" + the action card from Concept C (Stage 4)  */
/* ========================================================================== */

export const hero = {
  /**
   * COPY DIRECTION, still [CLIENT DATA REQUIRED] for final wording (Stage 5).
   *
   * Replaces "Форма, яка залишається", which was placeholder text lifted from
   * the wireframe and told a visitor arriving from Instagram nothing: not who
   * this is, not who it is for. This says the one thing no other trainer in
   * Lubny can claim as plainly, and it is short enough that the display size
   * can never crop it.
   */
  headlineLines: ["Одна людина.", "Один план."],
  sub: "Тренер і нутриціолог. Працюю з жінками в Лубнах і онлайн.",

  /**
   * The hero asks the funnel's own first question and takes the answer here,
   * so arriving at the form means step 1 is already behind you. The values
   * are the Stage 9 goal enum, not new copy invented for the hero.
   */
  question: "З чого почнемо?",
  entries: [
    { goal: "start" as LeadGoal, label: "З нуля" },
    { goal: "plateau" as LeadGoal, label: "Зрушити з плато" },
    { goal: "nutrition" as LeadGoal, label: "Розібратись з їжею" },
    // "Not sure" is an answer, not a failure to answer, so it sits with the
    // others and carries the enum's `other` rather than leaving the goal blank.
    { goal: "other" as LeadGoal, label: "Ще не знаю, з чого" },
  ],

  secondary: { label: "Програма харчування", href: "/program" },
};

/* ========================================================================== */
/* 02 TRUST STRIP — renders only with >= 2 confirmed facts (Stage 3)          */
/* ========================================================================== */

export type TrustFact = {
  value: string;
  label: string;
  /** Numeric facts get the mono count-up treatment. */
  numeric?: boolean;
};

/**
 * Only add a fact here once Anastasia has confirmed it. Two entries below are
 * established throughout the blueprint (the trainer + nutritionist positioning
 * and the club itself). The commented ones are still [УТОЧНИТИ].
 */
export const trustFacts: TrustFact[] = [
  // [IG] "10 років створюю сильних і впевнених дівчат". Her own public claim,
  // and the figure the blueprint kept referring to.
  { value: "10", label: "років практики", numeric: true },
  { value: "Тренер + нутриціолог", label: "одна людина, один план" },
  { value: "Власний клуб", label: "Crazy Fitness, Лубни" },
  // Number of clients stays open: nowhere public states it. Opus Part 0.1.
];

/* ========================================================================== */
/* 03 FOR WHOM                                                                */
/* ========================================================================== */

export const forWhom = {
  eyebrow: "ДЛЯ КОГО ЦЕ",
  heading: "Впізнала себе?",
  /** States, not diagnoses. Opus 6.2 §03. */
  states: [
    "Починаєш у понеділок і зупиняєшся в середу.",
    "Тренуєшся давно, а тіло не змінюється.",
    "Знаєш про їжу все і досі не знаєш, що їсти.",
    "Соромно зайти в зал, де всі ніби знають, що роблять.",
  ],
  cta: "Записатися на консультацію",
};

/* ========================================================================== */
/* 04 METHOD — vertical timeline, orange progress line (Stage 3 / Stage 15)   */
/* ========================================================================== */

export type MethodStep = {
  title: string;
  body: string;
  photo: string | null;
};

export const method = {
  eyebrow: "ЯК ЦЕ ПРАЦЮЄ",
  heading: "Система, а не мотивація",
  /**
   * COPY DIRECTION. Stage 5 marks the real process as [CLIENT DATA REQUIRED]:
   * these four steps describe a structure, not Anastasia's actual protocol,
   * and must be replaced with her own words before launch.
   */
  steps: [
    {
      title: "Розбираємось, де ти зараз",
      body: "Спосіб життя, режим, травми, що вже пробувала і на чому зупинилась. Без цього будь-який план — це чужий план.",
      photo: null,
    },
    {
      title: "Складаємо план під твій графік",
      body: "Тренування і харчування збираються навколо твого тижня, а не навпаки. План, який не вписується в життя, не виконується.",
      photo: null,
    },
    {
      title: "Працюємо і коригуємо",
      body: "Техніка, навантаження, харчування. Раз на період дивимось, що працює, і міняємо те, що ні.",
      photo: null,
    },
    {
      title: "Ти залишаєшся з навичкою",
      body: "Мета — щоб ти могла тримати форму без мене. Не залежність від тренера, а власне розуміння свого тіла.",
      photo: null,
    },
  ] as MethodStep[],
};

/* ========================================================================== */
/* 05 ABOUT                                                                   */
/* ========================================================================== */

export const about = {
  eyebrow: "ЗАСНОВНИЦЯ",
  /** The story itself is still [CLIENT DATA REQUIRED]. Stage 5, section 05. */
  story: null as string | null,
  /**
   * [IG] Only what the profile actually claims. "Вища освіта" is vague on its
   * own; the specific qualification and any certificates are still needed, and
   * naming a qualification she has not claimed would be inventing a credential,
   * which is the worst possible field to guess in.
   */
  credentials: [
    "Вища освіта",
    "Тренер і нутриціолог в одній людині",
    "Засновниця клубу Crazy Fitness у Лубнах",
  ] as string[] | null,
  portrait: null as string | null,
  cta: "Записатися на консультацію",
};

/* ========================================================================== */
/* 06 SERVICES — accordion, 3 to 7 rows without relayout (Stage 6)            */
/* ========================================================================== */

export type Service = {
  id: string;
  name: string;
  hook: string;
  includes: string[];
  forWhom: string;
  /** Nullable: shown as "Ціна за запитом" until confirmed. Stage 24. */
  duration: string | null;
  /** Kopiykas, integer. Money is never a float. Stage 19. */
  priceFromAmount: number | null;
  /** Pre-fills step 2 of the lead form so the choice is not made twice. */
  prefillFormat: LeadFormat;
  prefillGoal?: LeadGoal;
};

/**
 * The four formats below are the ones the blueprint itself defines in the lead
 * form (Stage 9, step 2). The final service list is [УТОЧНИТИ] — Opus Q10.
 * Adding or removing rows here needs no layout work.
 */
export const services: Service[] = [
  {
    id: "personal",
    name: "Персональні тренування",
    hook: "Один на один, техніка під контролем",
    includes: [
      "Індивідуальний план тренувань",
      "Постановка техніки з нуля",
      "Коригування навантаження по ходу",
    ],
    forWhom: "Якщо потрібна увага до кожного руху і чіткий графік.",
    duration: null,
    priceFromAmount: null,
    prefillFormat: "personal",
  },
  {
    id: "group",
    name: "Групові тренування",
    hook: "Малі групи в Crazy Fitness",
    // [IG] Formats the club profile lists. Confirm which of these Anastasia
    // runs herself before this goes live.
    includes: [
      "Силовий фітнес, функціональні тренування",
      "Джампінг, TRX, BFB",
      "Контроль техніки від тренера",
    ],
    forWhom: "Якщо легше починати не наодинці.",
    duration: null,
    priceFromAmount: null,
    prefillFormat: "group",
  },
  {
    id: "online",
    name: "Онлайн-супровід",
    hook: "З будь-якого міста, з відеозвітами",
    includes: [
      "План тренувань під твій зал або дім",
      "Перевірка техніки по відео",
      "Зв'язок у Telegram між тренуваннями",
    ],
    forWhom: "Якщо не можеш приїжджати в зал регулярно.",
    duration: null,
    priceFromAmount: null,
    prefillFormat: "online",
  },
  {
    id: "nutrition",
    name: "Консультація нутриціолога",
    hook: "Харчування без заборонених списків",
    includes: [
      "Розбір поточного раціону",
      "Принципи, а не жорстке меню",
      "Що робити у поїздках і на свята",
    ],
    forWhom: "Якщо тренування вже є, а харчування — головне вузьке місце.",
    duration: null,
    priceFromAmount: null,
    prefillFormat: "unsure",
    prefillGoal: "nutrition",
  },
];

/* ========================================================================== */
/* 07 NUTRITION PRODUCT                                                       */
/* ========================================================================== */

export const product = {
  slug: "program",
  eyebrow: "ЦИФРОВИЙ ПРОДУКТ",
  name: "Програма харчування",
  /** COPY DIRECTION. What is actually inside is [CLIENT DATA REQUIRED], Q12. */
  benefits: [
    "Принципи, за якими ти сама складаєш меню",
    "Що робити, коли графік ламається",
    "Списки покупок і заміни продуктів",
  ],
  /** In kopiykas, integer. Stage 19 forbids floats for money. */
  priceAmount: null as number | null,
  currency: "UAH",
  /** Controls the "Тимчасово недоступно" badge, Stage 14. */
  active: true,
  mockup: null as string | null,
  /** What the buyer actually receives. Required before payment goes live. */
  deliveryAssetRef: null as string | null,
  /** Hours to manual delivery, shown on /thank-you-order. Stage 7. */
  deliveryHours: null as number | null,
};

/**
 * /program — the six blocks of Stage 7, mapped from the abstract product flow.
 *
 * The "who this is not for" list is not a rhetorical device. It is part of the
 * ethical block (Opus 10.4): a digital product sold to someone it cannot help
 * is a refund at best. Keeping it specific also does more for trust than
 * another list of benefits.
 */
export const programPage = {
  what: {
    heading: "Що це насправді",
    body: null as string | null,
  },
  /** The real contents are [CLIENT DATA REQUIRED], Opus Q12. */
  includes: null as string[] | null,
  suits: [
    "Ти вже тренуєшся, але харчування залишається здогадками",
    "Тобі потрібні принципи, а не меню на тиждень",
    "Ти хочеш розібратись сама, без постійного контролю",
  ],
  notSuits: [
    "Ти шукаєш дієту, яка дасть результат за сім днів",
    "Тобі потрібен індивідуальний план під медичний стан",
    "Ти не готова готувати й планувати покупки",
  ],
  /** Real spreads from the actual document. Never mocked-up screenshots. */
  spreads: [] as string[],
  how: [
    "Оформлюєш замовлення на цій сторінці",
    "Переходиш на сторінку оплати банку",
    "Отримуєш програму на пошту та в Telegram",
    "Пишеш мені, якщо щось незрозуміло",
  ],
  /**
   * ⚠ Required before launch and subject to legal review (Stage 24).
   * Nothing on this site is medical advice, and that has to be stated plainly
   * rather than buried in the offer document.
   */
  healthDisclaimer:
    "Матеріали програми мають інформаційний характер і не є медичною порадою. " +
    "Якщо ти маєш захворювання, вагітність або обмеження за здоров'ям, " +
    "спершу порадься з лікарем.",
};

/* ========================================================================== */
/* 08 CLUB                                                                    */
/* ========================================================================== */

export const club = {
  eyebrow: "CRAZY FITNESS CLUB",
  heading: "Тут працюють, а не фотографуються",
  caption: "Зал, у якому все відбувається.",
  photos: [] as string[],
  /**
   * Stage 3 branch. `true` -> "Записатися на пробне" into #zapys.
   * `false` -> the section keeps its trust role but stops promising a slot
   * that does not exist. Opus Q17 is still open, so the safe branch is false.
   */
  acceptingNewMembers: false,
};

/* ========================================================================== */
/* 09 REVIEWS — thresholds in Stage 10                                        */
/* ========================================================================== */

export type Review = {
  id: string;
  kind: "quote" | "screenshot" | "photo";
  /** Written consent on file. No consent, no publication. Stage 24. */
  consentOnFile: boolean;
  quote?: string;
  author?: string;
  image?: string;
};

/**
 * Empty on purpose. Stage 10:
 *   0 reviews  -> section is dropped from the release
 *   1-2        -> single large quote block, no fake "feed"
 *   3+         -> full mixed proof grid
 */
export const reviews: Review[] = [];

/* ========================================================================== */
/* 10 INSTAGRAM                                                               */
/* ========================================================================== */

export const instagram = {
  eyebrow: "СТЕЖ ЗА ПРОЦЕСОМ",
  heading: brand.instagramHandle,
  /**
   * [IG] Grid thumbnails from Anastasia's own profile, 360-512px wide. That is
   * plenty at the size these tiles render (~230px on desktop) and is exactly
   * what this section is: a window onto the feed.
   *
   * Six, not eight, so the row divides cleanly at every breakpoint (6 / 3 / 2).
   * Replace with fresh exports whenever the feed moves on.
   */
  posts: [
    "/instagram/post-00.jpg",
    "/instagram/post-01.jpg",
    "/instagram/post-02.jpg",
    "/instagram/post-04.jpg",
    "/instagram/post-06.jpg",
    "/instagram/post-10.jpg",
  ] as string[],
  cta: "Підписатися",
};

/* ========================================================================== */
/* 11 FAQ — Stage 11. Answers come from the client only.                      */
/* ========================================================================== */

export type FaqItem = {
  id: string;
  question: string;
  answer: string | null;
};

export const faq: FaqItem[] = [
  { id: "shy", question: "Мені соромно, я давно не тренувалась — це нормально?", answer: null },
  { id: "price", question: "Скільки коштує консультація і з чого складається ціна?", answer: null },
  { id: "different", question: "Чим ти відрізняєшся від інших тренерів?", answer: null },
  { id: "online", question: "Я в іншому місті й не можу приїхати в зал — це працює онлайн?", answer: null },
  { id: "program", question: "Що саме входить у програму харчування — це просто PDF з порадами?", answer: null },
  // Answer must stay free of numbers and deadlines. Opus Part 1.4.
  { id: "howfast", question: "Як швидко буде результат?", answer: null },
  { id: "notforme", question: "Що робити, якщо не піде або не сподобається?", answer: null },
  // Must match brand.responseTime word for word. Stage 11.
  { id: "reply", question: "За скільки ти відповідаєш на заявку?", answer: null },
];

/* ========================================================================== */
/* 12 LEAD FORM                                                               */
/* ========================================================================== */

export const leadForm = {
  eyebrow: "ЗАПИСАТИСЯ",
  heading: "Розкажи, з чим прийшла",
  goals: [
    { value: "start", label: "Почати з нуля" },
    { value: "plateau", label: "Зрушити з плато" },
    { value: "nutrition", label: "Харчування" },
    { value: "other", label: "Інше" },
  ] as { value: LeadGoal; label: string }[],
  formats: [
    { value: "personal", label: "Персональні" },
    { value: "group", label: "Групові" },
    { value: "online", label: "Онлайн" },
    { value: "unsure", label: "Ще не знаю" },
  ] as { value: LeadFormat; label: string }[],
};

/* ========================================================================== */
/* NAVIGATION                                                                 */
/* ========================================================================== */

export const nav: { label: string; href: string; section: SourceSection }[] = [
  { label: "Про мене", href: "/#pro", section: "hero" },
  { label: "Послуги", href: "/#poslugy", section: "services" },
  { label: "Програма", href: "/program", section: "product" },
];

export const CTA_LABEL = "Записатися";
export const ANCHOR = "#zapys";
