/**
 * The launch ceremony, in order. Every time is in milliseconds.
 *
 *   countdown on the curtains, copper kalash standing in front
 *   -> ribbon is cut ("cut")
 *   -> RITUAL   the kalash fades away, a coconut drops from between the curtains and cracks,
 *               the halves lift and the water splashes across the screen, then dries away
 *   -> the curtains draw open and flowers fall (like flowers poured over an idol)
 *   -> SHOW     the deities appear one by one while an aarti thali circles in front of them;
 *               gold coins and flowers rain from Durga Maa at the end
 *   -> the website slowly scrolls down to the bottom (src/lib/auto-scroll.ts)
 *
 * Change a number here and the whole sequence follows. (launch.css has --lc-open-ms for the curtain
 * speed; keep `open` below in step with it.)
 */

export const DEITIES = [
  { id: "ganesh", name: "Ganesh ji" },
  { id: "lakshmi", name: "Lakshmi ji" },
  { id: "saraswati", name: "Saraswati Maa" },
  { id: "kuber", name: "Kuber ji" },
  { id: "durga", name: "Durga Maa" },
] as const;

export const SEQ = {
  cut: 1150, // ribbon parts (matches --lc-cut-ms)
  open: 2700, // curtains draw open (matches --lc-open-ms)
  fade: 900, // the curtain layer lets go

  // ---- ritual (times from the end of the cut) ----
  kalashFade: 1400, // kalash fades away; starts at 0
  nutDrop: 1100, // coconut starts falling
  nutFall: 900, // ...and lands (then bounces)
  crack: 2300, // coconut splits in two
  pour: 2950, // halves lift and tip towards you
  splash: 3450, // first drops hit the screen
  splashSpan: 1700, // splashes keep arriving for this long
  waterHold: 2000, // the water stays this long after the last splash...
  waterFade: 1300, // ...then dries away
  halvesGone: 5400, // halves fade out

  // ---- show ----
  flowersFor: 7500, // flower rain after the curtains start opening
  deityStart: 1900, // first deity appears this long after the curtains start opening
  deityIn: 1800,
  deityHold: 4000, // how long each deity stays fully visible (fade in/out times are separate, below)
  deityOut: 1800,
  deityGap: 150,
  lastHoldExtra: 1500, // Durga Maa stays a little longer
  coinsDelay: 1500, // coins and flowers start flowing from her hands this long after she appears
  coinsFor: 6000,
  thaliIn: 1100,
  thaliOut: 1300,
  endPause: 600,
  stageFade: 900,
} as const;

/** Milliseconds from the start of the ritual to the moment the curtains start to open. */
export const OPEN_AT = SEQ.splash + SEQ.splashSpan + SEQ.waterHold - 500;

/** When each deity appears and when it is gone again, in ms from the moment the curtains start to open. */
export function deityTimes() {
  const one = SEQ.deityIn + SEQ.deityHold + SEQ.deityOut;
  return DEITIES.map((d, i) => {
    const start = SEQ.deityStart + i * (one + SEQ.deityGap);
    const extra = i === DEITIES.length - 1 ? SEQ.lastHoldExtra : 0;
    return { ...d, start, length: one + extra, end: start + one + extra };
  });
}

/** Length of the whole show, from the moment the curtains start to open until the stage lets go. */
export function showLength() {
  const t = deityTimes();
  return t[t.length - 1].end + SEQ.thaliOut + SEQ.endPause;
}

/**
 * The pictures in public/ceremony/. If one is ever missing, the ceremony draws its own stand-in for that piece
 * instead (and the browser console says which file was not found).
 */
export const ASSETS = {
  kalash: "/ceremony/kalash.webp",
  nutWhole: "/ceremony/nut-whole.webp",
  nutLeft: "/ceremony/nut-left.webp",
  nutRight: "/ceremony/nut-right.webp",
  thali: "/ceremony/thali.webp",
  /** the falling gold coins: four coins cut from Durga Maa's own picture, side by side in one strip */
  coins: "/ceremony/coins.webp",
} as const;

/**
 * The shankh + temple-bell clip. It starts the moment the ribbon is cut and is trimmed to run until the scroll starts
 * (53.5 s with the current timings: 1.15 cut + 6.65 ritual + show + 0.9 stage fade + 0.9 scroll delay).
 * If the file is missing, the old synthesised bell (lib/sound.ts) rings when the curtains open instead.
 */
export const AUDIO = { src: "/ceremony/aarti-bgm.mp3", skipFadeMs: 500 } as const;

/** Everything the ceremony loads ahead of time so nothing pops in late. */
export const PRELOAD = [...DEITIES.map((d) => `/ceremony/deities/${d.id}.webp`), "/ceremony/emblem.webp", ...Object.values(ASSETS)];

/** Timing for the CSS that fades each deity in and out (so CSS and JS always agree). */
export const DEITY_CSS = { "--d-in": `${SEQ.deityIn}ms`, "--d-hold": `${SEQ.deityHold}ms`, "--d-out": `${SEQ.deityOut}ms` } as const;
