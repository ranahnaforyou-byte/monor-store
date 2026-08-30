import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { tags } from "@/lib/cache";

export const SETTINGS_ID = "singleton";

export type PublicSettings = {
  storeName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  announcementBar: string;
  announcementActive: boolean;
  freeShippingThreshold: number | null;
  defaultHomeFee: number;
  defaultStopDeskFee: number;
  codEnabled: boolean;
  baridimobEnabled: boolean;
  baridimobInfo: string;
  maintenanceMode: boolean;
};

const DEFAULTS: PublicSettings = {
  storeName: "MONOR STORE",
  contactPhone: "",
  contactEmail: "",
  address: "",
  instagramUrl: "",
  facebookUrl: "",
  tiktokUrl: "",
  announcementBar: "",
  announcementActive: false,
  freeShippingThreshold: null,
  defaultHomeFee: 40000,
  defaultStopDeskFee: 25000,
  codEnabled: true,
  baridimobEnabled: false,
  baridimobInfo: "",
  maintenanceMode: false,
};

export const getStoreSettings = cache((): Promise<PublicSettings> =>
  unstable_cache(
    async () => {
      const row = await db.storeSetting.findUnique({ where: { id: SETTINGS_ID } });
      if (!row) return DEFAULTS;
      return {
        storeName: row.storeName,
        contactPhone: row.contactPhone,
        contactEmail: row.contactEmail,
        address: row.address,
        instagramUrl: row.instagramUrl,
        facebookUrl: row.facebookUrl,
        tiktokUrl: row.tiktokUrl,
        announcementBar: row.announcementBar,
        announcementActive: row.announcementActive,
        freeShippingThreshold: row.freeShippingThreshold,
        defaultHomeFee: row.defaultHomeFee,
        defaultStopDeskFee: row.defaultStopDeskFee,
        codEnabled: row.codEnabled,
        baridimobEnabled: row.baridimobEnabled,
        baridimobInfo: row.baridimobInfo,
        maintenanceMode: row.maintenanceMode,
      };
    },
    ["store-settings"],
    { tags: [tags.settings], revalidate: 300 },
  )(),
);

/** Ensures the singleton row exists; used by seed and admin. */
export async function ensureStoreSettings() {
  return db.storeSetting.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });
}
