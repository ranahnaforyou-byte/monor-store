"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createOrder } from "@/server/services/orders";
import { writeCartCookie } from "@/lib/cart/store";
import { revalidateMany, tags } from "@/lib/cache";

export type CheckoutState = {
  error?: string;
  field?: string;
};

export async function placeOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const input = {
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerEmail: formData.get("customerEmail"),
    wilayaCode: formData.get("wilayaCode"),
    communeName: formData.get("communeName"),
    addressLine: formData.get("addressLine"),
    deliveryMode: formData.get("deliveryMode"),
    paymentMethod: formData.get("paymentMethod"),
    notes: formData.get("notes"),
  };

  const result = await createOrder(input);
  if (!result.ok) {
    return { error: result.error, field: result.field };
  }

  await writeCartCookie([]);
  revalidateMany(tags.products);
  revalidatePath("/cart");
  redirect(`/order/${result.reference}`);
}
