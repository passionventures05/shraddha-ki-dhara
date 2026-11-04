"use client";
/**
 * The stage that sits in front of the launch curtains.
 *
 *   before the cut   a copper kalash stands in front of the curtains
 *   ritual           kalash fades -> coconut drops, cracks -> halves lift, water splashes the screen -> water dries
 *   show             curtains open under a rain of flowers; deities appear one by one while an aarti thali
 *                    circles; gold coins and flowers fall from Durga Maa
 *
 * All timings live in src/lib/ceremony.ts.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ASSETS, DEITY_CSS, OPEN_AT, PRELOAD, SEQ, deityTimes, showLength } from "@/lib/ceremony";
import { loadCoinPictures, startFall, startWater } from "@/lib/fall";
import { Art, KalashArt, NutHalfArt, NutWholeArt, ThaliArt } from "./ceremonyArt";

type Step = "wait" | "fade" | "drop" | "crack" | "pour" | "gone";
type DState = "off" | "in" | "hold" | "out";

/** One deity. If the picture cannot be loaded, the name is shown instead, so the screen is never left empty. */
function Deity({ id, name, state }: { id: string; name: string; state: DState }) {
  const [failed, setFailed] = useState(false);
  const src = `/ceremony/deities/${id}.webp`;
  if (failed) return <div className="cs-deity cs-deity--name" data-id={id} data-s={state}>{name}</div>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="cs-deity"
      data-id={id}
      data-s={state}
      src={src}
      width={720}
      height={1080}
      alt=""
      draggable={false}
      onError={() => {
        console.warn(`[ceremony] could not load ${src} - is the public/ceremony/deities folder deployed?`);
        setFailed(true);
      }}
    />
  );
}

export default function CeremonyStage({ play, onOpenCurtains, onEnd }: { play: boolean; onOpenCurtains: (fast?: boolean) => void; onEnd: (skipped: boolean) => void }) {
  const [step, setStep] = useState<Step>("wait");
  const [show, setShow] = useState(false);
  const [thali, setThali] = useState(false);
  const [ending, setEnding] = useState(false);
  const [dState, setDState] = useState<DState[]>(() => deityTimes().map(() => "off"));

  const rootRef = useRef<HTMLDivElement>(null);
  const halvesRef = useRef<HTMLDivElement>(null);
  const waterRef = useRef<HTMLCanvasElement>(null);
  const flowersRef = useRef<HTMLCanvasElement>(null);
  const coinsRef = useRef<HTMLCanvasElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const stops = useRef<(() => void)[]>([]);
  const started = useRef(false);
  const finished = useRef(false);
  const cbOpen = useRef(onOpenCurtains);
  const cbEnd = useRef(onEnd);
  cbOpen.current = onOpenCurtains;
  cbEnd.current = onEnd;

  // load the pictures while people are still watching the countdown
  useEffect(() => {
    PRELOAD.forEach((src) => {
      const i = new Image();
      i.src = src;
    });
    loadCoinPictures(ASSETS.coins);
  }, []);

  const cleanup = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    stops.current.forEach((s) => s());
    stops.current = [];
  }, []);
  useEffect(() => cleanup, [cleanup]);

  const finish = useCallback(
    (fast: boolean) => {
      if (finished.current) return;
      finished.current = true;
      cleanup();
      setThali(false);
      setEnding(true);
      timers.current.push(window.setTimeout(() => cbEnd.current(fast), fast ? 350 : SEQ.stageFade));
    },
    [cleanup],
  );

  const skip = useCallback(() => {
    if (!started.current || finished.current) return;
    // make sure the curtains are open before the stage lets go
    cbOpen.current(true);
    finish(true);
  }, [finish]);

  useEffect(() => {
    if (!play || started.current) return;
    started.current = true;
    skipRef.current?.focus({ preventScroll: true });
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    const phone = window.innerWidth < 700;

    setStep("fade");
    at(SEQ.nutDrop, () => setStep("drop"));
    at(SEQ.crack, () => setStep("crack"));
    at(SEQ.pour, () => setStep("pour"));
    at(SEQ.splash, () => {
      const el = halvesRef.current?.getBoundingClientRect();
      if (!waterRef.current) return;
      const origin = el ? { x: el.left + el.width / 2, y: el.top + el.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight * 0.75 };
      stops.current.push(startWater(waterRef.current, { origin, span: SEQ.splashSpan, hold: SEQ.waterHold, fade: SEQ.waterFade }));
    });
    at(SEQ.halvesGone, () => setStep("gone"));

    // curtains open, flowers fall
    at(OPEN_AT, () => {
      cbOpen.current();
      setShow(true);
      if (flowersRef.current) stops.current.push(startFall(flowersRef.current, { kind: "flowers", duration: SEQ.flowersFor, rate: phone ? 20 : 32 }));
    });

    // deities, one at a time: fade in, stay, fade out (the fading itself is CSS, see stage.css)
    const times = deityTimes();
    const setD = (i: number, v: DState) => setDState((prev) => prev.map((x, k) => (k === i ? v : x)));
    times.forEach((d, i) => {
      at(OPEN_AT + d.start, () => setD(i, "in"));
      at(OPEN_AT + d.start + SEQ.deityIn, () => setD(i, "hold"));
      at(OPEN_AT + d.start + d.length - SEQ.deityOut, () => setD(i, "out"));
    });
    const durga = times[times.length - 1];
    if (durga && coinsRef.current) {
      const durgaBox = () => rootRef.current?.querySelector('[data-id="durga"]')?.getBoundingClientRect();
      // a point on Durga Maa's picture, given as a fraction of its width and height (so it follows her on every screen)
      const handPoint = (fx: number, fyLo: number, fyHi: number) => () => {
        const r = durgaBox();
        if (!r || !r.width) return { x: window.innerWidth * (0.5 + (fx - 0.5) * 0.7), y: window.innerHeight * 0.6 };
        return { x: r.left + r.width * fx, y: r.top + r.height * (fyLo + Math.random() * (fyHi - fyLo)) };
      };
      // in her picture a coin is about 2.3% of the picture's width: falling coins are drawn at exactly that size
      const coinSize = () => (durgaBox()?.width ?? window.innerWidth * 0.5) * 0.0235;
      at(OPEN_AT + durga.start + SEQ.coinsDelay, () => {
        // gold coins slip from the end of the coin strand in her lower right hand
        if (coinsRef.current) stops.current.push(startFall(coinsRef.current, { kind: "coins", duration: SEQ.coinsFor, rate: phone ? 16 : 24, from: handPoint(0.769, 0.7, 0.755), coinSize }));
        // flowers are showered from her raised blessing hand (a little smaller than the first rain)
        if (flowersRef.current) stops.current.push(startFall(flowersRef.current, { kind: "flowers", duration: SEQ.coinsFor, rate: phone ? 10 : 16, from: handPoint(0.322, 0.47, 0.54), sizeScale: 0.66 }));
      });
    }

    // the aarti thali circles for as long as the deities are there
    at(OPEN_AT + SEQ.deityStart - 400, () => setThali(true));
    at(OPEN_AT + (durga ? durga.end : showLength()), () => setThali(false));
    at(OPEN_AT + showLength(), () => finish(false));
  }, [play, finish]);

  // Escape skips the ceremony
  useEffect(() => {
    if (!play) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && skip();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [play, skip]);

  const times = deityTimes();
  return (
    <div ref={rootRef} className="cs" data-lc="" style={DEITY_CSS as CSSProperties} data-step={step} data-live={play ? "1" : "0"} data-show={show ? "1" : "0"} data-thali={thali ? "1" : "0"} data-end={ending ? "1" : "0"}>
      <div className="cs-scrim" aria-hidden />

      <div className="cs-kalash" aria-hidden>
        <Art className="cs-fill" src={ASSETS.kalash} width={400} height={600} fallback={<KalashArt />} />
      </div>

      <div className="cs-nut" aria-hidden>
        <Art className="cs-fill" src={ASSETS.nutWhole} width={240} height={240} fallback={<NutWholeArt />} />
      </div>
      <div className="cs-flash" aria-hidden />
      <div ref={halvesRef} className="cs-halves" aria-hidden>
        <div className="cs-half cs-half--l"><Art className="cs-fill" src={ASSETS.nutLeft} width={240} height={200} fallback={<NutHalfArt side="l" />} /></div>
        <div className="cs-half cs-half--r"><Art className="cs-fill" src={ASSETS.nutRight} width={240} height={200} fallback={<NutHalfArt side="r" />} /></div>
      </div>

      <div className="cs-deities" aria-hidden>
        {times.map((d, i) => (
          <Deity key={d.id} id={d.id} name={d.name} state={dState[i] ?? "off"} />
        ))}
      </div>

      <canvas ref={flowersRef} className="cs-cv" aria-hidden />
      <canvas ref={coinsRef} className="cs-cv" aria-hidden />
      <canvas ref={waterRef} className="cs-cv" aria-hidden />

      <div className="cs-thali" aria-hidden style={{ "--r": "clamp(34px, 11vmin, 150px)" } as CSSProperties}>
        <div className="cs-thali-x"><div className="cs-thali-y"><div className="cs-thali-art">
          <Art className="cs-fill" src={ASSETS.thali} width={600} height={440} fallback={<ThaliArt />} />
        </div></div></div>
      </div>

      {play && !ending && (
        <button ref={skipRef} type="button" className="cs-skip" onClick={skip}>
          Skip
          <span aria-hidden> ›</span>
        </button>
      )}
    </div>
  );
}
