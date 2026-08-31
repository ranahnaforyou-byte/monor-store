/**
 * Nightly database backup: pg_dump -> gzip -> local ./backups (and Google Drive
 * once GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 + GOOGLE_DRIVE_ROOT_FOLDER_ID are set,
 * implemented in Phase 7). Retention: keep 30 daily / 12 weekly.
 *
 *   npm run backup:db
 *
 * Requires `pg_dump` on PATH (bundled with the embedded Postgres binaries used
 * for local dev, or the server's postgresql-client in production).
 */
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readdir, readFile, stat, unlink } from "node:fs/promises";
import { createGzip } from "node:zlib";
import path from "node:path";
import { drive } from "../src/lib/drive/client";
import { rootSubfolder } from "../src/lib/drive/archive";

const OUT_DIR = path.join(process.cwd(), "backups");
const KEEP_DAILY = 30;

function dumpFileName() {
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `monor-db-${ts}.sql.gz`;
}

async function pruneOld() {
  const files = (await readdir(OUT_DIR)).filter((f) => f.endsWith(".sql.gz")).sort().reverse();
  for (const f of files.slice(KEEP_DAILY)) {
    await unlink(path.join(OUT_DIR, f));
    console.log(`  pruned ${f}`);
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  await mkdir(OUT_DIR, { recursive: true });

  const outPath = path.join(OUT_DIR, dumpFileName());
  console.log(`Dumping to ${outPath} …`);

  await new Promise<void>((resolve, reject) => {
    const child = spawn("pg_dump", ["--no-owner", "--no-privileges", url], {
      stdio: ["ignore", "pipe", "inherit"],
    });
    const gzip = createGzip();
    const file = createWriteStream(outPath);
    child.stdout.pipe(gzip).pipe(file);
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`pg_dump exited ${code}`))));
  });

  const { size } = await stat(outPath);
  console.log(`✓ backup ${(size / 1024).toFixed(0)} KB`);
  await pruneOld();

  if (drive.isConfigured()) {
    try {
      const backups = await rootSubfolder("backups");
      const dbFolder = await drive.ensureFolder("db", backups!);
      const body = await readFile(outPath);
      const file = await drive.uploadFile(path.basename(outPath), body, "application/gzip", dbFolder);
      console.log(`→ uploaded to Google Drive (id ${file.id})`);
    } catch (err) {
      console.error("→ Google Drive upload failed:", (err as Error).message);
      process.exitCode = 1;
    }
  } else {
    console.log("→ Google Drive not configured; backup kept locally only.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
