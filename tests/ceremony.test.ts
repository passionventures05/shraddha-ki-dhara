import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ASSETS, DEITIES, OPEN_AT, PRELOAD, SEQ, deityTimes, showLength } from "../src/lib/ceremony";
import { bootScript, launch, parseLaunchTime } from "../src/lib/launch";

describe("ceremony timeline", () => {
  const t = deityTimes();

  it("shows Ganesh ji first and Durga Maa last", () => {
    expect(t.map((d) => d.id)).toEqual(["ganesh", "lakshmi", "saraswati", "kuber", "durga"]);
    expect(t).toHaveLength(DEITIES.length);
  });

  it("shows one deity at a time, never overlapping", () => {
    for (let i = 1; i < t.length; i++) expect(t[i]!.start).toBeGreaterThanOrEqual(t[i - 1]!.end);
  });

  it("each deity appears, holds and fades for the configured time (Durga Maa stays longer)", () => {
    const one = SEQ.deityIn + SEQ.deityHold + SEQ.deityOut;
    t.slice(0, -1).forEach((d) => expect(d.length).toBe(one));
    expect(t[t.length - 1]!.length).toBe(one + SEQ.lastHoldExtra);
  });

  it("runs in the right order: kalash, coconut, crack, pour, splash, then the curtains", () => {
    expect(SEQ.nutDrop).toBeLessThan(SEQ.crack);
    expect(SEQ.nutDrop + SEQ.nutFall).toBeLessThanOrEqual(SEQ.crack);
    expect(SEQ.crack).toBeLessThan(SEQ.pour);
    expect(SEQ.pour).toBeLessThan(SEQ.splash);
    expect(SEQ.halvesGone).toBeLessThan(OPEN_AT);
  });

  it("the water is gone about when the curtains finish starting to open, never after the show begins", () => {
    const waterGone = SEQ.splash + SEQ.splashSpan + SEQ.waterHold + SEQ.waterFade;
    expect(OPEN_AT).toBeLessThan(waterGone); // curtains start while the water dries away
    expect(waterGone).toBeLessThan(OPEN_AT + SEQ.deityStart); // ...and it is gone before the first deity
  });

  it("the first deity appears after the curtains have opened", () => {
    expect(SEQ.deityStart).toBeGreaterThanOrEqual(SEQ.open * 0.6);
  });

  it("coins and flowers from Durga Maa start while she is on screen", () => {
    const durga = t[t.length - 1]!;
    expect(SEQ.coinsDelay).toBeLessThan(durga.length);
  });

  it("the whole show outlasts the last deity and the thali", () => {
    expect(showLength()).toBeGreaterThan(t[t.length - 1]!.end + SEQ.thaliOut);
  });
});

describe("timings stay in step with launch.css", () => {
  const css = readFileSync("src/styles/launch.css", "utf8");
  const ms = (name: string) => Number(new RegExp(`--${name}:\\s*(\\d+)ms`).exec(css)?.[1]);
  it("cut / open / fade match", () => {
    expect(ms("lc-cut-ms")).toBe(SEQ.cut);
    expect(ms("lc-open-ms")).toBe(SEQ.open);
    expect(ms("lc-fade-ms")).toBe(SEQ.fade);
  });
});

describe("ceremony pictures", () => {
  it("every picture the ceremony uses is in public/ (so nothing can go missing on the live site)", () => {
    const files = [...PRELOAD, ...Object.values(ASSETS)];
    const missing = files.filter((f) => !existsSync(`public${f}`));
    expect(missing).toEqual([]);
  });
  it("there is a picture for every deity", () => {
    DEITIES.forEach((d) => expect(existsSync(`public/ceremony/deities/${d.id}.webp`)).toBe(true));
  });
});

describe("late visitors", () => {
  it("has a late-visitor window and passes it to the boot script", () => {
    expect(launch.lateGraceMinutes).toBeGreaterThanOrEqual(0);
    expect(bootScript()).toContain(`"g":${launch.lateGraceMinutes * 60000}`);
  });
  it("the launch moment is a valid future-proof timestamp", () => {
    expect(Number.isNaN(parseLaunchTime(launch.launchAt))).toBe(false);
  });
});
