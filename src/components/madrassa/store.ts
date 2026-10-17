"use client";

import { useSyncExternalStore } from "react";
import { VERSION, applyAction, seed, type ActionArgs, type ActionName, type Role, type World } from "./world";

export * from "./world";

/**
 * Browser store for the MA DRASSA demo.
 *
 * - Alone: the world lives in localStorage and syncs across tabs of the same
 *   browser (two windows side by side react live).
 * - In a session («جلسة عرض», `?room=1234`): the server holds the world; every
 *   device sends actions and polls for the new state, so a teacher's phone and
 *   a parent's phone see each other's actions within a second or two.
 *
 * Read/unread is per device (what *you* have opened), never shared.
 */

const KEY = "madrassa-demo";
const READ_KEY = "madrassa-read";
const ROOM_KEY = "madrassa-room";
const HOST_KEY = "madrassa-host";
const POLL_MS = 1500;

export type Sync = { room: string | null; status: "local" | "connecting" | "live" | "offline" | "missing"; host?: boolean };

const SEED = seed();
let world: World = SEED;
let read = new Set<number>();
let sync: Sync = { room: null, status: "local" };
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

// ------------------------------------------------------------- persistence
function readLocal(): World {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const w = JSON.parse(raw) as World;
      if (w.v === VERSION) return w;
    }
  } catch {}
  return seed();
}
function saveLocal() {
  if (sync.room) return; // a session's world belongs to the server
  try {
    window.localStorage.setItem(KEY, JSON.stringify(world));
  } catch {}
}
function saveRead() {
  try {
    window.localStorage.setItem(READ_KEY, JSON.stringify([...read].slice(-400)));
  } catch {}
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  world = readLocal();
  try {
    read = new Set(JSON.parse(window.localStorage.getItem(READ_KEY) ?? "[]") as number[]);
  } catch {}
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY || sync.room) return;
    world = readLocal();
    emit();
  });
  // a session link (?room=) wins; otherwise resume the last session on this device
  const fromUrl = new URLSearchParams(window.location.search).get("room");
  const last = (() => {
    try {
      return window.localStorage.getItem(ROOM_KEY);
    } catch {
      return null;
    }
  })();
  const room = fromUrl ?? last;
  if (room && /^\d{4}$/.test(room)) window.setTimeout(() => void joinRoom(room), 0); // never emit during a render
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useWorld(): World {
  return useSyncExternalStore(subscribe, () => (load(), world), () => SEED);
}
const LOCAL_SYNC: Sync = { room: null, status: "local" };
export function useSync(): Sync {
  return useSyncExternalStore(subscribe, () => (load(), sync), () => LOCAL_SYNC);
}
const NO_READ = new Set<number>();
export function useRead(): Set<number> {
  return useSyncExternalStore(subscribe, () => (load(), read), () => NO_READ);
}

export const unreadCount = (w: World, r: Role, seen: Set<number>) => w.notes.filter((n) => n.to === r && !n.read && !seen.has(n.id)).length;

// ------------------------------------------------------------------- session
let timer: number | undefined;
let version = 0;
let inflight = 0;
let queue: Promise<void> = Promise.resolve();

function setSync(s: Sync) {
  sync = s;
  emit();
}

async function pull() {
  const room = sync.room;
  if (!room) return;
  try {
    const r = await fetch(`/api/madrassa/room/${room}?v=${version}`, { cache: "no-store" });
    if (room !== sync.room) return;
    if (r.status === 404) return setSync({ ...sync, room, status: "missing" });
    if (!r.ok) return setSync({ ...sync, room, status: "offline" });
    let changed = false;
    if (r.status === 200 && inflight === 0) {
      const d = (await r.json()) as { v: number; world: World };
      if (d.world.v !== VERSION) return setSync({ ...sync, room, status: "missing" }); // a session from an older demo
      if (d.v > version) {
        version = d.v;
        world = d.world;
        changed = true;
      }
    }
    if (sync.status !== "live") setSync({ ...sync, room, status: "live" });
    else if (changed) emit();
  } catch {
    if (room === sync.room) setSync({ ...sync, room, status: "offline" });
  }
}

let ticks = 0;
let wired = false;
function startPolling() {
  window.clearInterval(timer);
  // visible: every 1.5 s; in the background: every ~6 s (keeps the database quiet)
  timer = window.setInterval(() => {
    ticks++;
    if (document.visibilityState === "visible" || ticks % 4 === 0) void pull();
  }, POLL_MS);
  if (!wired) {
    wired = true;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void pull();
    });
  }
}

export async function joinRoom(code: string) {
  version = 0;
  try {
    window.localStorage.setItem(ROOM_KEY, code);
  } catch {}
  // keep the code in the address bar so a reload or a shared link stays in the session
  const url = new URL(window.location.href);
  if (url.searchParams.get("room") !== code) {
    url.searchParams.set("room", code);
    window.history.replaceState(null, "", url);
  }
  let host = false;
  try {
    host = window.localStorage.getItem(HOST_KEY) === code;
  } catch {}
  setSync({ room: code, status: "connecting", host });
  await pull();
  startPolling();
}

export async function createRoom(): Promise<string | null> {
  try {
    const r = await fetch("/api/madrassa/room", { method: "POST" });
    if (!r.ok) return null;
    const { code } = (await r.json()) as { code: string };
    try {
      window.localStorage.setItem(HOST_KEY, code);
    } catch {}
    await joinRoom(code);
    return code;
  } catch {
    return null;
  }
}

export function leaveRoom() {
  window.clearInterval(timer);
  try {
    window.localStorage.removeItem(ROOM_KEY);
  } catch {}
  const url = new URL(window.location.href);
  url.searchParams.delete("room");
  window.history.replaceState(null, "", url);
  sync = { room: null, status: "local" };
  world = readLocal();
  emit();
}

function send(name: string, args: unknown[]) {
  const room = sync.room!;
  inflight++;
  queue = queue.then(async () => {
    try {
      const r = await fetch(`/api/madrassa/room/${room}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: name, args }),
      });
      if (r.ok && room === sync.room) {
        const d = (await r.json()) as { v: number; world: World };
        if (d.v > version) {
          version = d.v;
          world = d.world;
        }
      } else if (!r.ok && room === sync.room) {
        setSync({ ...sync, room, status: r.status === 404 ? "missing" : "offline" });
      }
    } catch {
      if (room === sync.room) setSync({ ...sync, room, status: "offline" });
    } finally {
      inflight--;
      emit();
    }
  });
}

// ------------------------------------------------------------------- actions
function dispatch(name: string, args: unknown[]) {
  const next = applyAction(world, name, args);
  if (!next) return;
  world = next; // optimistic: the screen answers instantly
  saveLocal();
  emit();
  if (sync.room) send(name, args);
}

type Acts = { [K in ActionName]: (...args: ActionArgs<K>) => void } & { reset(): void; markRead(role: Role): void };

export const act = new Proxy({} as Acts, {
  get(_, name: string) {
    if (name === "reset")
      return () => {
        read = new Set();
        saveRead();
        if (sync.room) {
          world = seed();
          emit();
          send("reset", []);
          return;
        }
        try {
          window.localStorage.removeItem(KEY);
        } catch {}
        world = seed();
        emit();
      };
    if (name === "markRead")
      return (role: Role) => {
        const fresh = world.notes.filter((n) => n.to === role && !n.read && !read.has(n.id));
        if (!fresh.length) return;
        read = new Set([...read, ...fresh.map((n) => n.id)]);
        saveRead();
        emit();
      };
    return (...args: unknown[]) => dispatch(name, args);
  },
});
