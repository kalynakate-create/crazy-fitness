/**
 * POST /api/order — Stage 7, with the payment step removed.
 *
 * There is no electronic payment. This records the request and tells Anastasia
 * about it; she then settles and delivers directly. So the route no longer
 * creates an invoice or hands back a redirect — it behaves exactly like the
 * lead endpoint, for a request that happens to name a product.
 *
 * The amount comes from the server-side content file, never from the request
 * body, and may be null: with manual settlement the price can be agreed in the
 * conversation, so a missing price no longer blocks the order.
 */

import { NextResponse } from "next/server";
import { product } from "@/content/site";
import { clientIp, isRateLimited, submittedTooFast, trippedHoneypot } from "@/lib/rate-limit";
import { saveOrder } from "@/lib/sheets";
import { notifyOrder } from "@/lib/telegram";
import type { Order, OrderInput } from "@/lib/types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  // Only `active` gates the form now; the price does not.
  if (!product.active) {
    return NextResponse.json({ error: "product_unavailable" }, { status: 409 });
  }

  let body: OrderInput;
  try {
    body = (await req.json()) as OrderInput;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (trippedHoneypot(body.website) || submittedTooFast(body.elapsedMs)) {
    return NextResponse.json({ ok: true });
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
    // Global WebCrypto, not node:crypto: available on Workers and on Node.
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    productId: product.slug,
    buyerName: name,
    buyerEmail: email,
    buyerContact: contact,
    amount: product.priceAmount,
    currency: "UAH",
    paymentProvider: "manual",
    paymentStatus: "pending",
    deliveryStatus: "pending",
    sourceSection: "product",
    utmSource: body.utmSource,
    utmMedium: body.utmMedium,
    utmCampaign: body.utmCampaign,
  };

  const [stored, notified] = await Promise.all([
    saveOrder(order).catch(() => false),
    notifyOrder(order).catch(() => false),
  ]);

  if (!stored && !notified) {
    console.error("[order] both sinks failed", { id: order.id });
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
