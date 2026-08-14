/**
 * GOOGLE SHEETS — MVP storage, Stage 18.
 *
 * No database. Anastasia opens a spreadsheet and sees her leads; that is the
 * whole admin panel, and it costs nothing to run. Swapping this for a real
 * store later means changing this file only.
 *
 * The service-account JWT is signed with node:crypto rather than pulling in
 * googleapis, which would be roughly 50 MB of dependency for two HTTP calls.
 */

import { createSign } from "node:crypto";
import type { Lead, Order } from "./types";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string | null> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Vercel stores the key with literal \n sequences, so restore real newlines.
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const signature = base64url(signer.sign(key));
  const assertion = `${header}.${claim}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) return null;

  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
}

async function appendRow(sheet: string, row: (string | number)[]): Promise<boolean> {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const token = await accessToken();
  if (!sheetId || !token) return false;

  const range = encodeURIComponent(`${sheet}!A:Z`);
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}` +
    `:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [row] }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function saveLead(lead: Lead): Promise<boolean> {
  return appendRow("Leads", [
    lead.id,
    lead.createdAt,
    lead.goal,
    lead.format,
    lead.name,
    lead.contact,
    lead.contactType,
    lead.consentAt,
    lead.note ?? "",
    lead.sourceSection,
    lead.utmSource ?? "",
    lead.utmMedium ?? "",
    lead.utmCampaign ?? "",
    lead.status,
  ]);
}

export function saveOrder(order: Order): Promise<boolean> {
  return appendRow("Orders", [
    order.id,
    order.createdAt,
    order.productId,
    order.buyerName,
    order.buyerEmail,
    order.buyerContact,
    order.amount,
    order.currency,
    order.paymentProvider,
    order.paymentStatus,
    order.deliveryStatus,
    order.utmSource ?? "",
    order.utmMedium ?? "",
    order.utmCampaign ?? "",
  ]);
}
