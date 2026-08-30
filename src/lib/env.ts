import "server-only";
import { z } from "zod";

/**
 * Server-side environment. Validated once, at module load.
 * Never import this from a Client Component.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().url(),
  APP_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  APP_ENCRYPTION_KEY: z
    .string()
    .min(1)
    .refine((v) => {
      try {
        return Buffer.from(v, "base64").length === 32;
      } catch {
        return false;
      }
    }, "APP_ENCRYPTION_KEY must be base64 for exactly 32 bytes"),

  // Storage / CDN — optional; empty means "use local disk fallback".
  R2_ACCOUNT_ID: z.string().optional().default(""),
  R2_ACCESS_KEY_ID: z.string().optional().default(""),
  R2_SECRET_ACCESS_KEY: z.string().optional().default(""),
  R2_BUCKET: z.string().optional().default(""),
  R2_PUBLIC_BASE_URL: z.string().optional().default(""),

  // Google Drive — optional; empty means Drive features are disabled.
  GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: z.string().optional().default(""),
  GOOGLE_DRIVE_ROOT_FOLDER_ID: z.string().optional().default(""),

  // Yalidine — optional; empty means shipping sync is disabled.
  YALIDINE_API_ID: z.string().optional().default(""),
  YALIDINE_API_TOKEN: z.string().optional().default(""),
  YALIDINE_BASE_URL: z.string().url().optional().default("https://api.yalidine.app/v1"),
  YALIDINE_WEBHOOK_SECRET: z.string().optional().default(""),

  // BaridiMob
  BARIDIMOB_ENABLED: z
    .string()
    .optional()
    .default("0")
    .transform((v) => v === "1" || v.toLowerCase() === "true"),
  BARIDIMOB_ACCOUNT_INFO: z.string().optional().default(""),
  BARIDIMOB_WEBHOOK_SECRET: z.string().optional().default(""),

  CRON_SECRET: z.string().min(1).default("dev-cron-secret"),

  SENTRY_DSN: z.string().optional().default(""),
});

const parsed = serverSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
  throw new Error(
    `Invalid environment variables:\n${issues}\n\nCopy .env.example to .env.local and fill the required values.`,
  );
}

export const env = parsed.data;

/** Convenience flags derived from env. */
export const features = {
  r2: Boolean(env.R2_ACCESS_KEY_ID && env.R2_BUCKET && env.R2_PUBLIC_BASE_URL),
  drive: Boolean(env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 && env.GOOGLE_DRIVE_ROOT_FOLDER_ID),
  yalidine: Boolean(env.YALIDINE_API_ID && env.YALIDINE_API_TOKEN),
  baridimob: env.BARIDIMOB_ENABLED,
  sentry: Boolean(env.SENTRY_DSN),
} as const;
