/**
 * Money is stored in kopiykas as an integer (Stage 19) and only ever becomes a
 * string at the edge, here.
 *
 * `null` returns `null`, never "0 грн" and never "від —". A price that has not
 * been confirmed has no display form; the caller is expected to fall back to
 * "Ціна за запитом" rather than print a number nobody approved.
 */

const uah = new Intl.NumberFormat("uk-UA", {
  style: "currency",
  currency: "UAH",
  maximumFractionDigits: 0,
});

export function formatMoney(amountKopiykas: number | null): string | null {
  if (amountKopiykas === null || !Number.isFinite(amountKopiykas)) return null;
  return uah.format(amountKopiykas / 100);
}

export const PRICE_ON_REQUEST = "Ціна за запитом";

export function priceLabel(amountKopiykas: number | null, prefix = "від"): string {
  const value = formatMoney(amountKopiykas);
  return value ? `${prefix} ${value}` : PRICE_ON_REQUEST;
}
