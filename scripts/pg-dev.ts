/**
 * Local development Postgres — no Docker required.
 *
 *   npm run db:up     # start (keeps running in the foreground; use a background shell)
 *   npm run db:down   # stop
 *
 * Production uses a real managed Postgres via DATABASE_URL. This script only
 * exists so the app can run on a machine without Docker or a local server.
 */
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import net from "node:net";
import EmbeddedPostgres from "embedded-postgres";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, ".pgdata");
const PORT = 5432;
const USER = "postgres";
const PASSWORD = "postgres";
const DB_NAME = "monor";

function portOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.setTimeout(500, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function makePg() {
  return new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: USER,
    password: PASSWORD,
    port: PORT,
    persistent: true,
    // Force a UTF-8 cluster so Arabic content stores correctly regardless of
    // the host machine's Windows locale.
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
  });
}

async function start() {
  if (await portOpen(PORT)) {
    console.log(`[pg-dev] Something is already listening on :${PORT} — assuming Postgres is up.`);
    keepAlive();
    return;
  }

  await mkdir(DATA_DIR, { recursive: true });
  const pg = await makePg();

  const freshInstall = !existsSync(path.join(DATA_DIR, "PG_VERSION"));
  if (freshInstall) {
    console.log("[pg-dev] Initialising a new cluster in .pgdata …");
    await pg.initialise();
  }

  console.log("[pg-dev] Starting Postgres …");
  await pg.start();

  try {
    await pg.createDatabase(DB_NAME);
    console.log(`[pg-dev] Created database "${DB_NAME}".`);
  } catch {
    // already exists
  }

  console.log(
    `[pg-dev] Ready.  DATABASE_URL="postgresql://${USER}:${PASSWORD}@localhost:${PORT}/${DB_NAME}?schema=public"`,
  );

  const shutdown = async () => {
    console.log("\n[pg-dev] Stopping Postgres …");
    try {
      await pg.stop();
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  keepAlive();
}

function keepAlive() {
  // Hold the event loop open so the child Postgres process stays alive.
  setInterval(() => {}, 1 << 30);
}

async function stop() {
  const pg = await makePg();
  try {
    await pg.stop();
    console.log("[pg-dev] Stopped.");
  } catch (err) {
    console.log("[pg-dev] Not running (or already stopped).", (err as Error).message);
  }
}

const cmd = process.argv[2] ?? "start";
if (cmd === "start") {
  start().catch((err) => {
    console.error("[pg-dev] Failed to start:", err);
    process.exit(1);
  });
} else if (cmd === "stop") {
  stop();
} else {
  console.error(`Unknown command "${cmd}". Use "start" or "stop".`);
  process.exit(1);
}
