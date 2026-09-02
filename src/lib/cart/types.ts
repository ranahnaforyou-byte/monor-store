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

/**
 * Shape of a cart resolved against live DB data. Defined here (a client-safe
 * module) so Client Components can import the type without pulling in the
 * server-only cart service.
 */
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
