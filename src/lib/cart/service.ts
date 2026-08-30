import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { readCartCookie } from "./store";
import { lineKey } from "./store";
import type { CartLine } from "./types";

export type ResolvedCartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string | null;
  blurDataURL: string | null;
  size: string;
  color: string | null;
  unitPrice: number; // centimes, live from DB
  compareAtPrice: number | null;
  quantity: number; // clamped to available stock
  requestedQuantity: number;
  availableForSize: number;
  lineTotal: number;
  adjusted: boolean; // qty was clamped
  unavailable: boolean; // product gone / inactive / size 0
};

export type ResolvedCart = {
  items: ResolvedCartItem[];
  itemCount: number;
  subtotal: number;
  hasIssues: boolean;
};

/** Resolve the cookie cart against the DB. NEVER trusts cookie prices/stock. */
export const resolveCart = cache(async (): Promise<ResolvedCart> => {
  const lines = await readCartCookie();
  return resolveLines(lines);
});

export async function resolveLines(lines: CartLine[]): Promise<ResolvedCart> {
  if (lines.length === 0) {
    return { items: [], itemCount: 0, subtotal: 0, hasIssues: false };
  }

  const products = await db.product.findMany({
    where: { id: { in: [...new Set(lines.map((l) => l.productId))] } },
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      price: true,
      compareAtPrice: true,
      status: true,
      sizeStock: { select: { size: true, quantity: true } },
      images: {
        orderBy: { position: "asc" },
        take: 1,
        select: { url: true, blurDataURL: true },
      },
    },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const items: ResolvedCartItem[] = lines.map((line) => {
    const p = byId.get(line.productId);
    const key = lineKey(line);
    if (!p || p.status !== "ACTIVE") {
      return blankItem(key, line);
    }
    const stockForSize = p.sizeStock.find((s) => s.size === line.size)?.quantity ?? 0;
    const qty = Math.max(0, Math.min(line.quantity, stockForSize));
    const image = p.images[0]?.url ?? null;
    return {
      key,
      productId: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      image,
      blurDataURL: p.images[0]?.blurDataURL ?? null,
      size: line.size,
      color: line.color ?? null,
      unitPrice: p.price,
      compareAtPrice: p.compareAtPrice,
      quantity: qty,
      requestedQuantity: line.quantity,
      availableForSize: stockForSize,
      lineTotal: p.price * qty,
      adjusted: qty !== line.quantity,
      unavailable: qty === 0,
    };
  });

  const live = items.filter((i) => !i.unavailable);
  const subtotal = live.reduce((sum, i) => sum + i.lineTotal, 0);
  const itemCount = live.reduce((sum, i) => sum + i.quantity, 0);
  const hasIssues = items.some((i) => i.unavailable || i.adjusted);

  return { items, itemCount, subtotal, hasIssues };
}

function blankItem(key: string, line: CartLine): ResolvedCartItem {
  return {
    key,
    productId: line.productId,
    slug: line.slug,
    name: line.slug,
    brand: "",
    image: null,
    blurDataURL: null,
    size: line.size,
    color: line.color ?? null,
    unitPrice: 0,
    compareAtPrice: null,
    quantity: 0,
    requestedQuantity: line.quantity,
    availableForSize: 0,
    lineTotal: 0,
    adjusted: true,
    unavailable: true,
  };
}
