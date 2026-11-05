/**
 * The shankh + temple-bell clip that plays through the launch ceremony (public/ceremony/aarti-bgm.mp3).
 *
 *  - prepareAarti()  while the countdown runs: loads the file, and listens for the visitor's first tap / click / key
 *                    press. Browsers only allow sound after such a gesture, so that first tap "unlocks" the clip.
 *  - startAarti()    when the ribbon is cut (t = 0 of the ceremony). If the browser blocks it, the clip starts at the
 *                    visitor's next tap and jumps to the right position so it stays in step with the idols.
 *  - stopAarti()     Skip / Escape / unmount: fade out (or stop at once).
 *  - aartiMissing()  true when the file could not be loaded; the old synthesised bell is used instead then.
 */
import { AUDIO } from "./ceremony";

const GESTURES = ["pointerdown", "touchend", "keydown", "click"] as const;

let el: HTMLAudioElement | null = null;
let missing = false;
let started = false;
let stopped = false;
let priming = false;
let t0 = 0; // performance.now() when the ceremony started
let fadeTimer = 0;
let listening = false;
let cbs: { onTap?: () => void; onMissing?: () => void } = {};

const secsIn = () => (performance.now() - t0) / 1000;

/** Plays from where the ceremony is right now (used when the browser made us wait for a tap). */
function playInStep() {
  if (!el || missing || !started || stopped) return;
  const at = secsIn();
  if (Number.isFinite(el.duration) && at >= el.duration - 0.2) return; // the clip is already over
  el.muted = false;
  el.volume = 1;
  if (Math.abs(el.currentTime - at) > 0.4) {
    try {
      el.currentTime = at;
    } catch {
      /* not seekable yet: it will play from the start */
    }
  }
  el.play().catch(() => {
    /* still blocked: the next tap tries again */
  });
}

function onGesture() {
  cbs.onTap?.();
  if (!el || missing) return;
  if (started) {
    if (el.paused) playInStep();
    else detach();
    return;
  }
  // Before the ceremony: play silently for an instant inside the tap, so Safari / iOS let this same element
  // make sound later without another tap.
  if (priming) return;
  priming = true;
  el.muted = true;
  el.play()
    .then(() => {
      if (!started) {
        el?.pause();
        if (el) el.currentTime = 0;
        if (el) el.muted = false;
      } else if (el) {
        el.muted = false;
      }
    })
    .catch(() => {
      if (el) el.muted = false;
    })
    .finally(() => {
      priming = false;
    });
}

function attach() {
  if (listening) return;
  listening = true;
  GESTURES.forEach((g) => window.addEventListener(g, onGesture, { capture: true, passive: true }));
}
function detach() {
  if (!listening) return;
  listening = false;
  GESTURES.forEach((g) => window.removeEventListener(g, onGesture, { capture: true }));
}

/** Loads the clip. Returns a function that tears everything down. */
export function prepareAarti(callbacks: { onTap?: () => void; onMissing?: () => void } = {}): () => void {
  if (typeof window === "undefined") return () => {};
  stopAarti(false);
  cbs = callbacks;
  missing = false;
  started = false;
  stopped = false;
  priming = false;
  try {
    el = new Audio(AUDIO.src);
    el.preload = "auto";
    el.addEventListener("error", () => {
      missing = true;
      detach();
      cbs.onMissing?.();
    });
    el.addEventListener("playing", () => {
      if (started) detach();
    });
    el.load();
    attach();
  } catch {
    missing = true;
    cbs.onMissing?.();
  }
  return () => stopAarti(false);
}

/** Called the moment the ribbon is cut. */
export function startAarti() {
  if (!el || missing) return;
  started = true;
  stopped = false;
  t0 = performance.now();
  window.clearInterval(fadeTimer);
  el.muted = false;
  el.volume = 1;
  try {
    el.currentTime = 0;
  } catch {
    /* ignore */
  }
  el.play().catch(() => {
    /* blocked until the visitor taps; onGesture then starts it in step */
    attach();
  });
}

/** Fades the clip out (Skip) or stops it at once (page leaving / component unmounting). */
export function stopAarti(fade: boolean) {
  stopped = true;
  detach();
  window.clearInterval(fadeTimer);
  const a = el;
  if (!a) return;
  if (!fade || a.paused) {
    a.pause();
    el = null;
    return;
  }
  const steps = 10;
  let n = 0;
  const from = a.volume;
  fadeTimer = window.setInterval(() => {
    n += 1;
    a.volume = Math.max(0, from * (1 - n / steps));
    if (n >= steps) {
      window.clearInterval(fadeTimer);
      a.pause();
      if (el === a) el = null;
    }
  }, AUDIO.skipFadeMs / steps);
}

/** True when the clip could not be loaded (file not in public/ceremony/). */
export const aartiMissing = () => missing;
