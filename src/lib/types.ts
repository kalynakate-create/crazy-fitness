/**
 * DATA MODEL — Stage 19.
 *
 * `ConsultationRequest` is deliberately not a separate entity: it is the same
 * shape as `Lead` with the same fields, and splitting them would be the
 * enterprise-CRM complexity the blueprint rules out (Opus Part 12.2).
 */

export type LeadGoal = "start" | "plateau" | "nutrition" | "other";
export type LeadFormat = "personal" | "group" | "online" | "unsure";
export type ContactType = "phone" | "telegram";
export type LeadStatus = "new" | "contacted" | "won" | "lost";

export type SourceSection =
  | "hero"
  | "services"
  | "product"
  | "faq"
  | "sticky-bar"
  | "club";

export type Utm = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export type Lead = Utm & {
  id: string;
  createdAt: string;
  goal: LeadGoal;
  format: LeadFormat;
  name: string;
  contact: string;
  contactType: ContactType;
  consentAt: string;
  note?: string;
  sourceSection: SourceSection;
  status: LeadStatus;
};

/**
 * There is no electronic payment. Orders are settled directly with Anastasia
 * and marked off by hand, so the only provider is "manual". The status field
 * stays: she still needs to know which orders are paid and which are not, and
 * she sets it herself in the sheet.
 */
export type PaymentProvider = "manual";
export type PaymentStatus = "pending" | "paid" | "cancelled";
export type DeliveryStatus = "pending" | "delivered";

export type Order = Utm & {
  id: string;
  createdAt: string;
  productId: string;
  buyerName: string;
  buyerContact: string;
  buyerEmail: string;
  /**
   * Kopiykas, integer only — never a float for money. Null when the price has
   * not been set yet: with manual settlement the amount can be agreed in the
   * conversation, so a missing price no longer has to block an order.
   */
  amount: number | null;
  currency: "UAH";
  paymentProvider: PaymentProvider;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  deliveredAt?: string;
  sourceSection?: SourceSection;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  /** Kopiykas. */
  priceAmount: number;
  currency: "UAH";
  active: boolean;
  deliveryAssetRef: string;
};

/** Payload accepted by POST /api/lead. */
export type LeadInput = {
  goal: LeadGoal;
  format: LeadFormat;
  name: string;
  contact: string;
  note?: string;
  consent: boolean;
  sourceSection: SourceSection;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  /** Honeypot. Bots fill it, humans never see it. Stage 9. */
  website?: string;
  /**
   * How long the form was open, measured on the client. A duration, not a
   * timestamp: comparing the visitor's clock to the server's breaks for anyone
   * whose device clock is off. See submittedTooFast.
   */
  elapsedMs?: number;
};

/** Payload accepted by POST /api/order. */
export type OrderInput = {
  name: string;
  email: string;
  contact: string;
  consent: boolean;
  website?: string;
  elapsedMs?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

/**
 * Telegram handles and Ukrainian phone numbers are both accepted in one field,
 * detected by their first character. Stage 9.
 */
export function detectContactType(raw: string): ContactType | null {
  const value = raw.trim();
  if (/^@[A-Za-z0-9_]{4,32}$/.test(value)) return "telegram";
  const digits = value.replace(/[\s()\-]/g, "");
  if (/^(\+?38)?0\d{9}$/.test(digits)) return "phone";
  return null;
}
