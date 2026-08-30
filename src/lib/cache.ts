import "server-only";
import { revalidateTag } from "next/cache";

/** Cache tags for on-demand revalidation from admin mutations. */
export const tags = {
  products: "products",
  product: (slug: string) => `product:${slug}`,
  categories: "categories",
  category: (slug: string) => `category:${slug}`,
  settings: "settings",
  homepage: "homepage",
} as const;

/**
 * Next 16 requires a cacheLife profile as the 2nd arg to revalidateTag.
 * "max" gives the longest stale-while-revalidate window, which is what we want
 * for catalog content after an admin edit.
 */
export function revalidate(tag: string): void {
  revalidateTag(tag, "max");
}

export function revalidateMany(...tagList: string[]): void {
  for (const t of tagList) revalidateTag(t, "max");
}
