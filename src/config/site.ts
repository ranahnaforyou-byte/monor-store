/**
 * Static, build-time site identity. Operational values (phone, socials,
 * announcement bar, shipping fees) live in the DB `StoreSetting` row and are
 * editable from the admin panel.
 */
export const siteConfig = {
  name: "حانوت",
  shortName: "حانوت",
  tagline: "كلّ واحد ودوره",
  description:
    "حانوت — نظام يرتّب طلباتك وفريقك: تأكيد الطلبات، أقسام وأدوار، ومحادثة لكل قسم. من أول طلب حتى التسليم.",
  url: process.env.APP_URL ?? "http://localhost:3000",
  locale: "ar_DZ",
  defaultCurrency: "DZD",
} as const;

export type SiteConfig = typeof siteConfig;
