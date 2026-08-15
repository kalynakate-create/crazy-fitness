/**
 * GOOGLE SHEETS — MVP storage, Stage 18.
 *
 * No database. Anastasia opens a spreadsheet and sees her leads; that is the
 * whole admin panel, and it costs nothing to run. Swapping this for a real
 * store later means changing this file only.
 *
 * The service-account JWT is signed with WebCrypto rather than pulling in
 * googleapis, which would be roughly 50 MB of dependency for two HTTP calls.
 *
 * WebCrypto specifically, not node:crypto: `createSign` does not exist on
 * Cloudflare Workers, so the Node version tied lead capture to a Node host.
 * `crypto.subtle` is the one signing API that runs unchanged on Workers, on
 * Vercel, and in local Node, which keeps the deployment target an open choice.
 */

import type { Lead, Order } from "./types";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

/** Base64url over raw bytes, without Buffer, which Workers does not provide. */
function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlText(text: string): string {
  return base64url(new TextEncoder().encode(text));
}


/**
 * PEM (PKCS#8) to the DER bytes importKey expects.
 *
 * Backed by an explicit ArrayBuffer: since TypeScript 5.7 typed arrays carry
 * their buffer type, and WebCrypto will not accept a possibly-SharedArrayBuffer
 * view.
 */
function pemToDer(pem: string): Uint8Array<ArrayBuffer> {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/, "")
    .replace(/-----END [^-]+-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  const der = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) der[i] = binary.charCodeAt(i);
  return der;
}

/** Same constraint as pemToDer: WebCrypto needs ArrayBuffer-backed bytes. */
function utf8(text: string): Uint8Array<ArrayBuffer> {
  const encoded = new TextEncoder().encode(text);
  const bytes = new Uint8Array(new ArrayBuffer(encoded.length));
  bytes.set(encoded);
  return bytes;
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
  const header = base64urlText(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64urlText(
    JSON.stringify({
      iss: email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );

  const signingKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    signingKey,
    utf8(`${header}.${claim}`),
  );
  const assertion = `${header}.${claim}.${base64url(new Uint8Array(signed))}`;

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
