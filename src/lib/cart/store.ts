import "server-only";
import { cookies } from "next/headers";
import { cartCookieSchema, type CartLine } from "./types";

export const CART_COOKIE = "monor_cart";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function readCartCookie(): Promise<CartLine[]> {
  const store = await cookies();
  const raw = store.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = cartCookieSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

/** Only call from a Server Action or Route Handler. */
export async function writeCartCookie(lines: CartLine[]): Promise<void> {
  const store = await cookies();
  const safe = cartCookieSchema.parse(lines);
  if (safe.length === 0) {
    store.delete(CART_COOKIE);
    return;
  }
  store.set(CART_COOKIE, JSON.stringify(safe), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function lineKey(line: Pick<CartLine, "productId" | "size" | "color">): string {
  return `${line.productId}::${line.size}::${line.color ?? ""}`;
}
