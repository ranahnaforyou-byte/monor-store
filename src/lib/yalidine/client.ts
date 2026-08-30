import "server-only";
import { env, features } from "@/lib/env";

/**
 * Yalidine courier client — server only. Credentials come from
 * YALIDINE_API_ID / YALIDINE_API_TOKEN. When they are absent every call throws
 * `YalidineNotConfiguredError`; the app is designed so an order is always saved
 * first and courier sync is a separate, retryable step (see admin order page).
 *
 * Endpoints follow Yalidine's public REST API. Adjust paths here only.
 */
export class YalidineNotConfiguredError extends Error {
  constructor() {
    super("Yalidine credentials are not configured (YALIDINE_API_ID / YALIDINE_API_TOKEN).");
    this.name = "YalidineNotConfiguredError";
  }
}

export type YalidineParcelInput = {
  orderId: string; // our reference, used for idempotency on their side
  firstname: string;
  familyname: string;
  contactPhone: string;
  address: string;
  toWilayaName: string;
  toCommuneName: string;
  isStopdesk: boolean;
  productList: string;
  price: number; // COD amount in DZD (0 when prepaid)
  doInsurance?: boolean;
  height?: number;
  width?: number;
  length?: number;
  weight?: number;
};

export type YalidineParcelResult = {
  tracking: string;
  labelUrl?: string;
  raw: unknown;
};

class YalidineClient {
  private base = env.YALIDINE_BASE_URL.replace(/\/$/, "");

  isConfigured(): boolean {
    return features.yalidine;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.isConfigured()) throw new YalidineNotConfiguredError();
    const res = await fetch(`${this.base}${path}`, {
      ...init,
      headers: {
        "X-API-ID": env.YALIDINE_API_ID,
        "X-API-TOKEN": env.YALIDINE_API_TOKEN,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Yalidine ${path} failed: ${res.status} ${body.slice(0, 200)}`);
    }
    return (await res.json()) as T;
  }

  listWilayas() {
    return this.request<unknown>("/wilayas/");
  }
  listCommunes() {
    return this.request<unknown>("/communes/");
  }
  listCenters() {
    return this.request<unknown>("/centers/");
  }
  getFees(fromWilayaId: number, toWilayaId: number) {
    return this.request<unknown>(`/fees/?from_wilaya_id=${fromWilayaId}&to_wilaya_id=${toWilayaId}`);
  }

  async createParcel(input: YalidineParcelInput): Promise<YalidineParcelResult> {
    const payload = [
      {
        order_id: input.orderId,
        firstname: input.firstname,
        familyname: input.familyname,
        contact_phone: input.contactPhone,
        address: input.address,
        to_wilaya_name: input.toWilayaName,
        to_commune_name: input.toCommuneName,
        is_stopdesk: input.isStopdesk ? 1 : 0,
        product_list: input.productList,
        price: input.price,
        do_insurance: input.doInsurance ? 1 : 0,
        height: input.height ?? 0,
        width: input.width ?? 0,
        length: input.length ?? 0,
        weight: input.weight ?? 1,
        freeshipping: 0,
      },
    ];
    const data = await this.request<Record<string, { tracking?: string; label?: string; success?: boolean }>>(
      "/parcels/",
      { method: "POST", body: JSON.stringify(payload) },
    );
    const entry = Object.values(data)[0] ?? {};
    if (!entry.tracking) {
      throw new Error(`Yalidine createParcel returned no tracking: ${JSON.stringify(data).slice(0, 200)}`);
    }
    return { tracking: entry.tracking, labelUrl: entry.label, raw: data };
  }

  getParcel(tracking: string) {
    return this.request<unknown>(`/parcels/${encodeURIComponent(tracking)}`);
  }

  cancelParcel(tracking: string) {
    return this.request<unknown>(`/parcels/${encodeURIComponent(tracking)}`, { method: "DELETE" });
  }
}

export const yalidine = new YalidineClient();
