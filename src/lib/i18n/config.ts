/** Shared, client-safe i18n constants (no server imports). */

export const LOCALES = ["ar", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ar";
export const LOCALE_COOKIE = "monor_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "ar" || value === "fr";
}

export function dirForLocale(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export const LOCALE_LABELS: Record<Locale, string> = {
  ar: "العربية",
  fr: "Français",
};
