"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { readCartCookie, writeCartCookie, lineKey } from "@/lib/cart/store";
import { cartLineSchema, MAX_QTY_PER_LINE } from "@/lib/cart/types";
import type { Result } from "@/lib/utils";

const addSchema = cartLineSchema.pick({ productId: true, size: true }).extend({
  color: z.string().trim().optional(),
  quantity: z.coerce.number().int().min(1).max(MAX_QTY_PER_LINE).default(1),
});

export async function addToCart(input: unknown): Promise<Result<{ itemCount: number }>> {
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalidInput" };
  const { productId, size, color, quantity } = parsed.data;

  const product = await db.product.findFirst({
    where: { id: productId, status: "ACTIVE" },
    select: { slug: true, sizeStock: { where: { size }, select: { quantity: true } } },
  });
  if (!product) return { ok: false, error: "outOfStock" };
  const available = product.sizeStock[0]?.quantity ?? 0;
  if (available < 1) return { ok: false, error: "outOfStock" };

  const lines = await readCartCookie();
  const key = lineKey({ productId, size, color });
  const existing = lines.find((l) => lineKey(l) === key);
  const nextQty = Math.min(
    MAX_QTY_PER_LINE,
    available,
    (existing?.quantity ?? 0) + quantity,
  );

  if (existing) {
    existing.quantity = nextQty;
  } else {
    lines.push({ productId, slug: product.slug, size, color, quantity: nextQty });
  }

  await writeCartCookie(lines);
  revalidatePath("/cart");
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  return { ok: true, data: { itemCount } };
}

const updateSchema = z.object({
  key: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(MAX_QTY_PER_LINE),
});

export async function updateCartLine(input: unknown): Promise<Result<null>> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalidInput" };
  const { key, quantity } = parsed.data;

  let lines = await readCartCookie();
  const line = lines.find((l) => lineKey(l) === key);
  if (!line) return { ok: true, data: null };

  if (quantity === 0) {
    lines = lines.filter((l) => lineKey(l) !== key);
  } else {
    const available =
      (
        await db.sizeStock.findFirst({
          where: { productId: line.productId, size: line.size },
          select: { quantity: true },
        })
      )?.quantity ?? 0;
    line.quantity = Math.max(1, Math.min(quantity, MAX_QTY_PER_LINE, available || 1));
  }

  await writeCartCookie(lines);
  revalidatePath("/cart");
  return { ok: true, data: null };
}

export async function removeCartLine(key: string): Promise<Result<null>> {
  const lines = (await readCartCookie()).filter((l) => lineKey(l) !== key);
  await writeCartCookie(lines);
  revalidatePath("/cart");
  return { ok: true, data: null };
}

export async function clearCart(): Promise<Result<null>> {
  await writeCartCookie([]);
  revalidatePath("/cart");
  return { ok: true, data: null };
}
