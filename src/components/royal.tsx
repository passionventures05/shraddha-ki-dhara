"use client";
/**
 * Royal temple ornaments (images live in /public/ornaments).
 *
 *  - HangingPair   diya + temple bell that hang under the hero banner and swing when you scroll
 *  - SideTrails    flower trails fixed to both page edges on wide screens; they sway like a rope as you scroll
 *  - Toran         marigold door-garland
 *  - ArchFrame     carved gold arch with a velvet window for content
 *  - LotusDivider  ornamental rule under section headings
 *  - CornerFrame   gold filigree corners around a block of text
 *  - Pillars       a pair of carved pillars for a section's edges
 *
 * Motion is transform-only (cheap on phones) and switches off with "reduce motion".
 */
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ringBell } from "@/lib/sound";

const O = "/ornaments";
const still = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/* ---------- one shared spring simulation, driven by scrolling ---------- */

type Body = { el: HTMLElement; gain: number; k: number; c: number; min: number; max: number; a: number; v: number; on: boolean };
const bodies = new Set<Body>();
let raf = 0;
let last = 0;
let lastY = 0;

function tick(now: number) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  let live = false;
  bodies.forEach((b) => {
    if (!b.on) return;
    b.v += (-b.k * b.a - b.c * b.v) * dt; // damped spring: swings out, overshoots, settles
    b.a = clamp(b.a + b.v * dt, b.min, b.max);
    if (Math.abs(b.a) > 0.02 || Math.abs(b.v) > 0.05) live = true;
    else { b.a = 0; b.v = 0; }
    b.el.style.setProperty("--sw", `${b.a.toFixed(3)}deg`);
  });
  raf = live ? requestAnimationFrame(tick) : 0;
}
function wake() {
  if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
}
function onScroll() {
  const y = window.scrollY;
  const dy = clamp(y - lastY, -90, 90);
  lastY = y;
  if (!dy) return;
  bodies.forEach((b) => { if (b.on) b.v += dy * b.gain; });
  wake();
}

/** Makes an element swing from its top edge: a little push for every scroll, settling back like a hanging rope. */
function useSwing(ref: React.RefObject<HTMLElement | null>, o: { gain: number; k?: number; c?: number; max?: number; min?: number }) {
  const body = useRef<Body | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || still()) return;
    const max = o.max ?? 8;
    const b: Body = { el, gain: o.gain, k: o.k ?? 30, c: o.c ?? 3, min: o.min ?? -max, max, a: 0, v: 0, on: true };
    body.current = b;
    const io = new IntersectionObserver(([e]) => { b.on = e.isIntersecting; if (b.on) wake(); }, { rootMargin: "160px" });
    io.observe(el);
    bodies.add(b);
    if (bodies.size === 1) { lastY = window.scrollY; window.addEventListener("scroll", onScroll, { passive: true }); }
    return () => {
      io.disconnect();
      bodies.delete(b);
      body.current = null;
      if (!bodies.size) window.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (push: number) => { if (body.current) { body.current.v += push; wake(); } };
}

/* ---------- hanging diya (with live flames) and temple bell ---------- */

// where each wick ends on diya.webp (440 x 865), in percent
const WICKS: [number, number][] = [[10.9, 63.8], [27.3, 64.7], [50, 65.2], [73.2, 64.9], [89.8, 64.3]];

function Flame({ x, y, i }: { x: number; y: number; i: number }) {
  return (
    <span className="lamp-flame" style={{ left: `${x}%`, top: `${y}%`, "--fd": `${2.3 + (i % 3) * 0.37}s`, "--fl": `-${i * 0.55}s` } as CSSProperties}>
      <svg viewBox="0 0 24 56" aria-hidden focusable="false">
        <path d="M12 0C13.4 13 24 22 24 38c0 11-5.4 18-12 18S0 49 0 38C0 22 10.6 13 12 0Z" fill="url(#sd-flame)" />
        <ellipse cx="12" cy="44" rx="4.2" ry="8" fill="#FFF9E0" opacity=".92" />
      </svg>
    </span>
  );
}

export function HangingPair() {
  const diya = useRef<HTMLDivElement>(null);
  const bell = useRef<HTMLButtonElement>(null);
  useSwing(diya, { gain: 0.2, k: 24, c: 2.4, max: 5 });
  const kick = useSwing(bell, { gain: 0.16, k: 20, c: 1.5, max: 9 });
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
        <defs>
          <linearGradient id="sd-flame" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#FFB23A" /><stop offset=".45" stopColor="#FFD35E" /><stop offset="1" stopColor="#FFF4B8" stopOpacity=".15" />
          </linearGradient>
        </defs>
      </svg>
      <div ref={diya} className="hang hang-diya swing" aria-hidden>
        <div className="sway" style={{ "--sd": "7.5s", "--sa": "1.2deg" } as CSSProperties}>
          <div className="diya-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${O}/diya.webp`} width={440} height={865} alt="" decoding="async" />
            {WICKS.map(([x, y], i) => <Flame key={i} x={x} y={y} i={i} />)}
          </div>
        </div>
      </div>
      <button ref={bell} type="button" className="hang hang-bell swing" aria-label="Ring the temple bell"
        onClick={() => { kick(Math.random() < 0.5 ? -120 : 120); ringBell(); }}>
        <span className="sway" style={{ "--sd": "9s", "--sl": "-2s", "--sa": "1.6deg" } as CSSProperties}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${O}/bell.webp`} width={320} height={909} alt="" decoding="async" />
        </span>
      </button>
    </>
  );
}

/* ---------- flower trails down both page edges (wide screens only) ---------- */

export function SideTrails() {
  const root = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  useSwing(left, { gain: 0.22, k: 26, c: 2.6, max: 6, min: -2.5 }); // outward (towards the screen edge) swings further than inward
  useSwing(right, { gain: -0.22, k: 22, c: 2.3, max: 2.5, min: -6 }); // mirror image, so the pair breathes together
  const path = usePathname();
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let hdr = 74;
    // On the home page the banner already has its own garlands, so the trails drift in once the banner has scrolled away.
    const fade = () => {
      const hero = document.querySelector("[data-hero]");
      el.style.opacity = hero ? String(clamp(1 - (hero.getBoundingClientRect().bottom - hdr) / 300, 0, 1)) : "1";
    };
    const set = () => {
      const h = document.querySelector("header");
      hdr = h ? h.getBoundingClientRect().height : 74;
      el.style.setProperty("--hdr", `${hdr}px`);
      fade();
    };
    set();
    window.addEventListener("resize", set);
    window.addEventListener("scroll", fade, { passive: true });
    return () => { window.removeEventListener("resize", set); window.removeEventListener("scroll", fade); };
  }, [path]);
  return (
    <div ref={root} className="trails" aria-hidden>
      <div ref={left} className="trail trail-l swing"><div className="sway" style={{ "--sd": "8s", "--sa": "1deg" } as CSSProperties}><span className="trail-art" /></div></div>
      <div ref={right} className="trail trail-r swing"><div className="sway" style={{ "--sd": "10s", "--sl": "-3s", "--sa": "1deg" } as CSSProperties}><span className="trail-art" /></div></div>
    </div>
  );
}

/* ---------- toran, arch, divider, corners, pillars ---------- */

export function Toran({ className = "" }: { className?: string }) {
  return (
    <div className={`toran-img ${className}`} aria-hidden>
      <div className="sway" style={{ "--sd": "11s", "--sa": ".35deg" } as CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${O}/toran.webp`} width={1400} height={486} alt="" loading="lazy" decoding="async" />
      </div>
    </div>
  );
}

/** A carved gold arch. Whatever you put inside shows in a velvet window. */
export function ArchFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`arch-frame ${className}`}>
      <div className="arch-window metal">{children}</div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="arch-art" src={`${O}/arch.webp`} width={720} height={1083} alt="" loading="lazy" decoding="async" aria-hidden />
    </div>
  );
}

export function LotusDivider({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={`lotus-divider ${light ? "on-dark" : ""} ${className}`} src={`${O}/divider.webp`} width={1000} height={247} alt="" loading="lazy" decoding="async" aria-hidden />
  );
}

/** Gold filigree corners and a fine gold line around its content. */
export function CornerFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`cframe ${className}`}>
      <i className="cf-line" aria-hidden />
      {(["tl", "tr", "bl", "br"] as const).map((p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={p} className={`cf-corner cf-${p}`} src={`${O}/corner.webp`} width={560} height={560} alt="" loading="lazy" decoding="async" aria-hidden />
      ))}
      <div className="cf-body">{children}</div>
    </div>
  );
}

export function Pillars() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="pillar pillar-l" src={`${O}/pillar.webp`} width={249} height={900} alt="" loading="lazy" decoding="async" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="pillar pillar-r" src={`${O}/pillar.webp`} width={249} height={900} alt="" loading="lazy" decoding="async" aria-hidden />
    </>
  );
}
