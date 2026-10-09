"use client";

let ctx: AudioContext | null = null;

/** Browsers only allow audio after a tap; call this from any pointer handler. */
export function unlockAudio() {
  if (typeof window === "undefined") return;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    /* no audio on this device */
  }
}

/** Two-note "new order" chime — no audio file needed. */
export function playChime() {
  if (!ctx || ctx.state !== "running") return false;
  const now = ctx.currentTime;
  [
    [880, 0],
    [1318.5, 0.14],
  ].forEach(([freq, at]) => {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, now + at);
    g.gain.exponentialRampToValueAtTime(0.35, now + at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.45);
    o.connect(g).connect(ctx!.destination);
    o.start(now + at);
    o.stop(now + at + 0.5);
  });
  return true;
}

export function buzz() {
  try {
    navigator.vibrate?.([120, 60, 120]);
  } catch {
    /* ignore */
  }
}
