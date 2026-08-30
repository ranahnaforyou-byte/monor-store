import "server-only";
import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  type Locale,
} from "./config";
import arMessages from "@/messages/ar.json";
import frMessages from "@/messages/fr.json";

export type Messages = typeof arMessages;

const DICTIONARIES: Record<Locale, Messages> = {
  ar: arMessages,
  // fr.json is intentionally allowed to be a partial override of ar.json.
  fr: { ...arMessages, ...(frMessages as Partial<Messages>) } as Messages,
};

/** French is off at launch. When disabled we never touch cookies(), so
 *  storefront pages keep their static optimisation. */
const FRENCH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_FRENCH === "1";

export async function getLocale(): Promise<Locale> {
  if (!FRENCH_ENABLED) return DEFAULT_LOCALE;
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getMessages(locale?: Locale): Promise<Messages> {
  return DICTIONARIES[locale ?? (await getLocale())];
}

/**
 * Translation helper. `t("nav.shop")` -> string. Falls back to the key path
 * when a message is missing so the UI never renders `undefined`.
 */
export function createT(messages: Messages) {
  return function t(path: string): string {
    const value = path
      .split(".")
      .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], messages);
    return typeof value === "string" ? value : path;
  };
}

export type TFunction = ReturnType<typeof createT>;
