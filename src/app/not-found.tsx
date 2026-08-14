import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

/**
 * 404 — Stage 2. Minimal on purpose: logo, one line, one way back.
 *
 * The title is set explicitly because without it this page inherits the
 * homepage title, so a browser tab (and anyone's history) claims the visitor is
 * on the front page when they are actually looking at a dead end.
 */
export const metadata: Metadata = {
  title: "Такої сторінки нема | Crazy Fitness",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-5 py-24">
      <div className="w-full max-w-[520px]">
        <Link
          href="/#top"
          aria-label="Crazy Fitness, на головну"
          className="-m-3 inline-flex p-3"
        >
          <Logo variant="monogram" />
        </Link>

        <p className="mt-12 font-[family-name:var(--font-mono)] text-[13px] tracking-[0.12em] text-orange">
          404
        </p>
        <h1 className="t-h1 mt-4 text-white">Такої сторінки нема</h1>
        <p className="t-body-l mt-6 text-muted">
          Можливо, змінилось посилання. На головній є все.
        </p>

        <div className="mt-12">
          <Button href="/#top">На головну</Button>
        </div>
      </div>
    </main>
  );
}
