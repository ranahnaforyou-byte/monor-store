import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { getStoreSettings } from "./settings";
import type { DeliveryMode } from "@/generated/prisma";

export const listWilayas = cache(() =>
  unstable_cache(
    () => db.wilaya.findMany({ orderBy: { code: "asc" } }),
    ["wilayas"],
    { tags: ["shipping"], revalidate: 86400 },
  )(),
);

export const listCommunes = cache((wilayaCode: number) =>
  unstable_cache(
    () =>
      db.commune.findMany({
        where: { wilayaCode },
        orderBy: { name: "asc" },
      }),
    ["communes", String(wilayaCode)],
    { tags: ["shipping"], revalidate: 86400 },
  )(),
);

/** Shipping fee in centimes. DB rate cache first, store defaults as fallback. */
export async function getShippingFee(
  wilayaCode: number,
  mode: DeliveryMode,
): Promise<number> {
  const [rate, settings] = await Promise.all([
    db.shippingRate.findUnique({ where: { wilayaCode } }),
    getStoreSettings(),
  ]);
  if (rate?.active) {
    return mode === "STOP_DESK" ? rate.toStopDesk : rate.toHome;
  }
  return mode === "STOP_DESK" ? settings.defaultStopDeskFee : settings.defaultHomeFee;
}

export async function applyFreeShipping(
  subtotal: number,
  shippingFee: number,
): Promise<number> {
  const settings = await getStoreSettings();
  if (
    settings.freeShippingThreshold != null &&
    subtotal >= settings.freeShippingThreshold
  ) {
    return 0;
  }
  return shippingFee;
}
