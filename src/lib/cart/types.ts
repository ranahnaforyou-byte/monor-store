import { z } from "zod";

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  size: z.string().min(1),
  color: z.string().optional(),
  quantity: z.number().int().min(1).max(20),
});

export type CartLine = z.infer<typeof cartLineSchema>;

export const cartCookieSchema = z.array(cartLineSchema).max(50);

export const MAX_QTY_PER_LINE = 10;
