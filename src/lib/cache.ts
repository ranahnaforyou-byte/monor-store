import "server-only";
import { revalidateTag, updateTag } from "next/cache";

/** Cache tags. Storefront reads (unstable_cache) attach these; admin writes bust them. */
export const tags = {
  products: "products",
  product: (slug: string) => `product:${slug}`,
  categories: "categories",
  category: (slug: string) => `category:${slug}`,
  settings: "settings",
  homepage: "homepage",
  shipping: "shipping",
} as const;

/**
 * Bust cache tags from a Server Action with **immediate** effect
 * (read-your-own-writes): after an admin edit the storefront shows the change
 * on the very next request. Next 16's `updateTag` is Server-Action-only; every
 * caller here (admin CRUD, checkout) runs inside one.
 */
export function bust(...tagList: string[]): void {
  for (const t of tagList) updateTag(t);
}

/**
 * Stale-while-revalidate purge for use **outside** Server Actions
 * (Route Handlers: webhooks, cron). Content refreshes in the background.
 */
export function bustBackground(...tagList: string[]): void {
  for (const t of tagList) revalidateTag(t, "max");
}

// Back-compat aliases (previously used the SWR form everywhere).
export const revalidate = (tag: string): void => bust(tag);
export const revalidateMany = (...tagList: string[]): void => bust(...tagList);
