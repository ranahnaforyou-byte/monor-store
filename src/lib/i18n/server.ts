import "server-only";
import { cache } from "react";
import { getLocale, getMessages, createT, type Messages, type TFunction } from "./index";
import type { Locale } from "./config";

/** One call for pages/components: resolved locale + messages + t(). */
export const getI18n = cache(async (): Promise<{
  locale: Locale;
  messages: Messages;
  t: TFunction;
}> => {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  return { locale, messages, t: createT(messages) };
});
