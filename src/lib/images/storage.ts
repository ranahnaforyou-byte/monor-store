import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { AwsClient } from "aws4fetch";

/**
 * Storage abstraction for web-optimized product images.
 *
 * - Cloudflare R2 (when every R2_* var is set): S3-compatible, zero egress.
 * - Local disk (fallback): writes to public/uploads, served by Next directly,
 *   so the app runs end-to-end before a bucket is provisioned.
 *
 * Nothing else in the app changes when storage is swapped — this is the seam.
 * Reads `process.env` directly so scripts and the pipeline run without the full
 * validated server env.
 */
export interface ObjectStorage {
  put(key: string, body: Buffer, contentType: string): Promise<string>;
  delete(key: string): Promise<void>;
  url(key: string): string;
}

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");

function r2Env() {
  const accountId = process.env.R2_ACCOUNT_ID ?? "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID ?? "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? "";
  const bucket = process.env.R2_BUCKET ?? "";
  const publicBase = (process.env.R2_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  const ready = Boolean(accountId && accessKeyId && secretAccessKey && bucket && publicBase);
  return { accountId, accessKeyId, secretAccessKey, bucket, publicBase, ready };
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

function makeR2(): ObjectStorage {
  const { accountId, accessKeyId, secretAccessKey, bucket, publicBase } = r2Env();
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucket}`;
  const aws = new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" });

  return {
    async put(key, body, contentType) {
      const res = await aws.fetch(`${endpoint}/${encodeURI(key)}`, {
        method: "PUT",
        body: new Uint8Array(body),
        headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" },
      });
      if (!res.ok) {
        throw new Error(`R2 put ${key} failed: ${res.status} ${await res.text().catch(() => "")}`);
      }
      return `${publicBase}/${key.replace(/\\/g, "/")}`;
    },
    async delete(key) {
      await aws.fetch(`${endpoint}/${encodeURI(key)}`, { method: "DELETE" }).catch(() => {});
    },
    url(key) {
      return `${publicBase}/${key.replace(/\\/g, "/")}`;
    },
  };
}

export function getStorage(): ObjectStorage {
  return r2Env().ready ? makeR2() : localStorage;
}

export function usingLocalStorage(): boolean {
  return !r2Env().ready;
}
