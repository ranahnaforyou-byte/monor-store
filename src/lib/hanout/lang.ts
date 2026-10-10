import "server-only";
import { cookies } from "next/headers";

export type HnLang = "ar" | "en";
export const LANG_COOKIE = "hn_lang";

/** Marketing pages (/, /system) language — Arabic by default, English on request. */
export async function getHnLang(): Promise<HnLang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return v === "en" ? "en" : "ar";
}
