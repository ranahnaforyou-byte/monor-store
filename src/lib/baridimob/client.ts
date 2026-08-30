import "server-only";
import { env, features } from "@/lib/env";

/**
 * BaridiMob (Algérie Poste) has no universal public developer API. Launch uses
 * the manual verification flow: the customer submits a transaction reference,
 * an admin verifies it against the account statement and marks the order paid.
 *
 * `createGatewayPayment` is the seam for a future official merchant/gateway
 * integration — implement it here and flip BARIDIMOB to gateway mode without
 * touching the checkout or admin code.
 */
export class BaridimobGatewayUnavailableError extends Error {
  constructor() {
    super("BaridiMob gateway is not available. Launch uses manual verification.");
    this.name = "BaridimobGatewayUnavailableError";
  }
}

export const baridimob = {
  isEnabled(): boolean {
    return features.baridimob;
  },

  /** Free-text instructions shown to the customer (RIP / account holder). */
  getInstructions(): string {
    return env.BARIDIMOB_ACCOUNT_INFO;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createGatewayPayment(_args: { orderReference: string; amount: number; returnUrl: string }): Promise<never> {
    throw new BaridimobGatewayUnavailableError();
  },
};
