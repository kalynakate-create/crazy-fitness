/**
 * HOMEPAGE — the 13 sections of Stage 3, in order.
 *
 * The two order decisions worth remembering, because they look arbitrary until
 * you know why:
 *
 *   Recognition (03) and method (04) come before "about Anastasia" (05). The
 *   reader has to care about the problem before she cares who solves it.
 *
 *   Instagram (10) sits right after the reviews, not between the FAQ and the
 *   form. In the original order it was an exit door at the point of highest
 *   intent. There is now nothing between the FAQ and the form to click away to.
 *
 * Trust Strip, Reviews and FAQ can each return null when their content
 * threshold is not met. That is intended: the page reflows cleanly and the
 * site can launch without them.
 */

import { About } from "@/components/sections/About";
import { Club } from "@/components/sections/Club";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { ForWhom } from "@/components/sections/ForWhom";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Instagram } from "@/components/sections/Instagram";
import { LeadForm } from "@/components/sections/LeadForm";
import { Method } from "@/components/sections/Method";
import { NutritionTeaser } from "@/components/sections/NutritionTeaser";
import { Reviews } from "@/components/sections/Reviews";
import { Services } from "@/components/sections/Services";
import { StickyCta } from "@/components/sections/StickyCta";
import { TrustStrip } from "@/components/sections/TrustStrip";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <ForWhom />
        <Method />
        <About />
        <Services />
        <NutritionTeaser />
        <Club />
        <Reviews />
        <Instagram />
        <Faq />
        <LeadForm />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
