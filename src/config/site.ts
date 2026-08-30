/**
 * Static, build-time site identity. Operational values (phone, socials,
 * announcement bar, shipping fees) live in the DB `StoreSetting` row and are
 * editable from the admin panel.
 */
export const siteConfig = {
  name: "MONOR STORE",
  shortName: "MONOR",
  tagline: "أحذية كرة القدم الاحترافية",
  description:
    "MONOR STORE — متجر جزائري متخصص في بيع أحذية كرة القدم الأصلية. توصيل لكل الولايات والدفع عند الاستلام.",
  url: process.env.APP_URL ?? "http://localhost:3000",
  locale: "ar_DZ",
  defaultCurrency: "DZD",
} as const;

export type SiteConfig = typeof siteConfig;
