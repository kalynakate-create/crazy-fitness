/**
 * POST /api/order — Stage 7 / Stage 18.
 *
 * We do not build a checkout UI. The order is recorded, then the buyer is sent
 * to the payment provider's own hosted page, which is the actual checkout. That
 * is the whole MVP: no cart, no e-commerce engine, one product at a fixed
 * price, delivery by hand.
 *
 * Monobank is the default because a ФОП can raise an invoice there with the
 * lowest integration cost in Ukraine. If MONOBANK_TOKEN is set we create a real
 * invoice; otherwise we fall back to a static payment link, which is enough to
 * start selling on day one.
 *
 * Amount is read from the server-side content file, never from the request
 * body. A price that arrives from the client is a price the client can change.
 */

import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { product } from "@/content/site";
import { clientIp, isRateLimited, submittedTooFast, trippedHoneypot } from "@/lib/rate-limit";
import { saveOrder } from "@/lib/sheets";
import { notifyOrder } from "@/lib/telegram";
import type { Order, OrderInput } from "@/lib/types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function monobankInvoice(order: Order): Promise<string | null> {
  const token = process.env.MONOBANK_TOKEN;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!token) return process.env.MONOBANK_PAYMENT_URL ?? null;

  try {
    const res = await fetch("https://api.monobank.ua/api/merchant/invoice/create", {
      method: "POST",
      headers: { "X-Token": token, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: order.amount,
        ccy: 980, // UAH
        merchantPaymInfo: {
          reference: order.id,
          destination: product.name,
        },
        redirectUrl: `${siteUrl}/thank-you-order`,
        webHookUrl: `${siteUrl}/api/payment-webhook`,
      }),
    });
    if (!res.ok) return process.env.MONOBANK_PAYMENT_URL ?? null;
    const json = (await res.json()) as { pageUrl?: string };
    return json.pageUrl ?? process.env.MONOBANK_PAYMENT_URL ?? null;
  } catch {
    return process.env.MONOBANK_PAYMENT_URL ?? null;
  }
}

export async function POST(req: Request) {
  if (!product.active || product.priceAmount === null) {
    return NextResponse.json({ error: "product_unavailable" }, { status: 409 });
  }

  let body: OrderInput;
  try {
    body = (await req.json()) as OrderInput;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (trippedHoneypot(body.website) || submittedTooFast(body.renderedAt)) {
    return NextResponse.json({ ok: true, paymentUrl: null });
  }

  const ip = clientIp(req);

  if (isRateLimited(ip, "request")) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const contact = String(body.contact ?? "").trim();

  if (name.length < 2 || !EMAIL.test(email) || contact.length < 3 || body.consent !== true) {
    return NextResponse.json({ error: "validation_failed" }, { status: 422 });
  }

  if (isRateLimited(ip, "submit")) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const order: Order = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    productId: product.slug,
    buyerName: name,
    buyerEmail: email,
    buyerContact: contact,
    amount: product.priceAmount,
    currency: "UAH",
    paymentProvider: "monobank",
    paymentStatus: "pending",
    deliveryStatus: "pending",
    sourceSection: "product",
    utmSource: body.utmSource,
    utmMedium: body.utmMedium,
    utmCampaign: body.utmCampaign,
  };

  const [stored, notified, paymentUrl] = await Promise.all([
    saveOrder(order).catch(() => false),
    notifyOrder(order).catch(() => false),
    monobankInvoice(order),
  ]);

  if (!stored && !notified) {
    console.error("[order] both sinks failed", { id: order.id });
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }

  if (!paymentUrl) {
    console.error("[order] no payment url configured", { id: order.id });
    return NextResponse.json({ error: "payment_unconfigured" }, { status: 503 });
  }

  return NextResponse.json({ ok: true, paymentUrl });
}
