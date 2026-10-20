/** Temple bell, synthesised in the browser (no audio files). Off until the visitor switches it on. */
const KEY = "sdSound";
let ctx: AudioContext | null = null;

export const soundOn = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};
export const setSound = (on: boolean) => {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {}
  window.dispatchEvent(new Event("sd-sound"));
};

/** Plays the bell. With force=true it plays even when sound is off (used by the toggle as a preview). */
export function ringBell(force = false) {
  if (typeof window === "undefined" || (!force && !soundOn())) return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx ?? new AC();
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);
    // bell partials: [frequency, loudness, ring time in seconds]
    ([[880, 1, 2.4], [2434, 0.5, 1.7], [4752, 0.28, 1.1], [7860, 0.14, 0.7]] as const).forEach(([f, a, d]) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(a, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + d + 0.05);
    });
  } catch {
    /* sound is a bonus; never break the page */
  }
}
