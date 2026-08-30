import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

/**
 * AES-256-GCM for integration secrets stored in StoreSetting.secretsEnc.
 * Format: base64(iv[12] || authTag[16] || ciphertext).
 */
const KEY = Buffer.from(env.APP_ENCRYPTION_KEY, "base64");

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptSecret(payload: string): string {
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

/** Encrypt a record of secret values; keeps keys, encrypts values. */
export function encryptSecretMap(map: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) out[k] = encryptSecret(v);
  return out;
}

export function decryptSecretMap(
  map: Record<string, string> | null | undefined,
): Record<string, string> {
  if (!map) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) {
    try {
      out[k] = decryptSecret(v);
    } catch {
      out[k] = "";
    }
  }
  return out;
}
