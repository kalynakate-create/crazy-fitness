/**
 * POST /api/lead — Stage 18 / Stage 20.
 *
 * The form posts here, never straight to an inbox (Opus Part 12.3). Two sinks
 * run in parallel: the spreadsheet Anastasia actually reads, and a Telegram
 * message so she knows within seconds.
 *
 * Failure policy is the important part. A lead is somebody's decision to ask
 * for help, so losing one is the worst outcome available. If either sink
 * succeeds the request succeeds; only if both fail do we return an error, which
 * is what makes the form show its Telegram fallback instead of swallowing the
 * submission.
 */

import { NextResponse } from "next/server";
import { clientIp, isRateLimited, submittedTooFast, trippedHoneypot } from "@/lib/rate-limit";
import { saveLead } from "@/lib/sheets";
import { notifyLead } from "@/lib/telegram";
import { detectContactType, type Lead, type LeadInput } from "@/lib/types";

const GOALS = new Set(["start", "plateau", "nutrition", "other"]);
const FORMATS = new Set(["personal", "group", "online", "unsure"]);
const SECTIONS = new Set(["hero", "services", "product", "faq", "sticky-bar", "club"]);

export async function POST(req: Request) {
  let body: LeadInput;
  try {
    body = (await req.json()) as LeadInput;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  /* Spam checks answer 200 rather than 4xx: a bot learns nothing from a
     success, and a false positive on a real person still looks like it worked
     while we watch the logs. */
  if (trippedHoneypot(body.website) || submittedTooFast(body.elapsedMs)) {
    return NextResponse.json({ ok: true });
  }

  const ip = clientIp(req);

  // Loose ceiling first: stops hammering without charging a real person for a
  // typo. The tight limit is applied below, once we know this is a real lead.
  if (isRateLimited(ip, "request")) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const name = String(body.name ?? "").trim();
  const contact = String(body.contact ?? "").trim();
  const contactType = detectContactType(contact);

  if (
    name.length < 2 ||
    !contactType ||
    body.consent !== true ||
    !GOALS.has(body.goal) ||
    !FORMATS.has(body.format)
  ) {
    return NextResponse.json({ error: "validation_failed" }, { status: 422 });
  }

  if (isRateLimited(ip, "submit")) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const now = new Date().toISOString();
  const lead: Lead = {
    // Global WebCrypto, not node:crypto: available on Workers and on Node.
    id: crypto.randomUUID(),
    createdAt: now,
    goal: body.goal,
    format: body.format,
    name,
    contact,
    contactType,
    consentAt: now,
    note: body.note?.trim() || undefined,
    sourceSection: SECTIONS.has(body.sourceSection) ? body.sourceSection : "hero",
    status: "new",
    utmSource: body.utmSource,
    utmMedium: body.utmMedium,
    utmCampaign: body.utmCampaign,
  };

  const [stored, notified] = await Promise.all([
    saveLead(lead).catch(() => false),
    notifyLead(lead).catch(() => false),
  ]);

  if (!stored && !notified) {
    console.error("[lead] both sinks failed", { id: lead.id });
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }

  if (!stored) console.warn("[lead] sheets failed, telegram delivered", { id: lead.id });
  if (!notified) console.warn("[lead] telegram failed, sheets stored", { id: lead.id });

  return NextResponse.json({ ok: true });
}
