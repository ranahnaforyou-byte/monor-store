import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

/**
 * Storage abstraction for web-optimized product images.
 *
 * - Local disk (default): writes to public/uploads, served by Next directly.
 *   Used until a real bucket is provisioned so the app runs end-to-end now.
 * - Cloudflare R2 (when R2_* env is set): implemented in Phase 7 (media
 *   pipeline). The interface below is the seam — nothing else in the app
 *   changes when storage is swapped.
 *
 * Reads `process.env` directly (not the validated env module) so scripts and
 * the image pipeline can run without the full server env being present.
 */
export interface ObjectStorage {
  put(key: string, body: Buffer, contentType: string): Promise<string>;
  delete(key: string): Promise<void>;
  url(key: string): string;
}

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");

function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCESS_KEY_ID && process.env.R2_BUCKET && process.env.R2_PUBLIC_BASE_URL,
  );
}

const localStorage: ObjectStorage = {
  async put(key, body) {
    const full = path.join(LOCAL_DIR, key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, body);
    return `/uploads/${key.replace(/\\/g, "/")}`;
  },
  async delete(key) {
    try {
      await unlink(path.join(LOCAL_DIR, key));
    } catch {
      /* already gone */
    }
  },
  url(key) {
    return `/uploads/${key.replace(/\\/g, "/")}`;
  },
};

const r2NotConfigured: ObjectStorage = {
  put() {
    throw new Error(
      "R2 storage selected but not fully configured. Set R2_* env vars or unset them to use local disk.",
    );
  },
  delete() {
    return Promise.resolve();
  },
  url(key) {
    return `${(process.env.R2_PUBLIC_BASE_URL ?? "").replace(/\/$/, "")}/${key}`;
  },
};

export function getStorage(): ObjectStorage {
  // R2 implementation lands in Phase 7; until then local disk is authoritative.
  return r2Configured() ? r2NotConfigured : localStorage;
}

export function usingLocalStorage(): boolean {
  return !r2Configured();
}
