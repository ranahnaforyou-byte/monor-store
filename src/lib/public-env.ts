/**
 * Client-safe environment. Only `NEXT_PUBLIC_*` values.
 * Safe to import from Client Components.
 */
export const publicEnv = {
  enableFrench: process.env.NEXT_PUBLIC_ENABLE_FRENCH === "1",
  imageBaseUrl: process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? "",
  analyticsUrl: process.env.NEXT_PUBLIC_ANALYTICS_URL ?? "",
  /** DEMO / client-review mode: shows "أسعار تجريبية" banners and price tags.
   *  Flip to "0" (or remove) for production — no code changes needed. */
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "1",
} as const;
