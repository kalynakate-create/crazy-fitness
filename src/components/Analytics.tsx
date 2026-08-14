"use client";

/**
 * GA4 + META PIXEL — Stage 23, gated by Stage 9 consent.
 *
 * Neither tag is in the document until consent is granted, so a visitor who
 * declines never loads them at all. That also keeps them off the critical path
 * for the first paint, which matters on the mobile connections this site is
 * actually used on (Stage 21).
 */

import Script from "next/script";
import { useEffect, useState } from "react";
import { readConsent } from "@/lib/consent";

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function Analytics() {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    const sync = () => setGranted(readConsent() === "granted");
    sync();
    window.addEventListener("cf-consent-change", sync);
    return () => window.removeEventListener("cf-consent-change", sync);
  }, []);

  if (!granted) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}

      {PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
