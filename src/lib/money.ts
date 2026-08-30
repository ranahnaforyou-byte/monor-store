/**
 * Money in MONOR is ALWAYS an integer number of centimes (1 DZD = 100 centimes).
 * Never use floats for money. This module is the single place money becomes text.
 */

export const CENTIMES_PER_DZD = 100;

const NNBSP = " "; // narrow no-break space — the thousands separator

/** 1_250_000 (centimes) -> "12 500 دج". Western digits + thin-space grouping,
 *  so the amount reads identically in Arabic (RTL) and French. */
export function formatDZD(
  centimes: number,
  opts: { withSuffix?: boolean; locale?: "ar" | "fr" } = {},
): string {
  const { withSuffix = true, locale = "ar" } = opts;
  const cents = Math.round(centimes);
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const dinars = Math.floor(abs / CENTIMES_PER_DZD);
  const frac = abs % CENTIMES_PER_DZD;

  let n = String(dinars).replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);
  if (negative) n = `-${n}`;
  if (frac !== 0) n += `.${String(frac).padStart(2, "0")}`;

  if (!withSuffix) return n;
  return locale === "fr" ? `${n} DA` : `${n} دج`;
}

/** Parse a user-entered dinar amount ("12 500" | "12500.5") to centimes. */
export function parseDZDToCentimes(input: string): number | null {
  const cleaned = input
    .replace(/[^\d.,-]/g, "")
    .replace(/[\s  ]/g, "")
    .replace(",", ".");
  if (cleaned === "" || cleaned === "-") return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * CENTIMES_PER_DZD);
}

/** Percentage saved when compareAtPrice is set and higher than price. */
export function discountPercent(
  price: number,
  compareAtPrice: number | null,
): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
