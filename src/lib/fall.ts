/**
 * Canvas effects for the launch ceremony: falling flowers, spinning gold coins and coconut-water splashes.
 * Everything is drawn in code, so it works with no extra image files.
 */

type Sprite = HTMLCanvasElement;
const TAU = Math.PI * 2;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)] as T;
const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
const easeOutBack = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);

function mk(w: number, h: number): [Sprite, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d") as CanvasRenderingContext2D];
}

/* ------------------------------------------------------------------ sprites */

function petal(c1: string, c2: string, edge: string): Sprite {
  const [s, g] = mk(64, 64);
  g.translate(32, 32);
  const gr = g.createLinearGradient(0, -28, 0, 28);
  gr.addColorStop(0, c1);
  gr.addColorStop(1, c2);
  g.fillStyle = gr;
  g.beginPath();
  g.moveTo(0, -29);
  g.bezierCurveTo(24, -18, 22, 16, 0, 29);
  g.bezierCurveTo(-22, 16, -24, -18, 0, -29);
  g.closePath();
  g.fill();
  g.strokeStyle = edge;
  g.lineWidth = 1.3;
  g.stroke();
  g.strokeStyle = "rgba(0,0,0,.14)";
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(0, -22);
  g.lineTo(0, 23);
  g.stroke();
  g.fillStyle = "rgba(255,255,255,.28)";
  g.beginPath();
  g.ellipse(-7, -8, 4, 11, 0.25, 0, TAU);
  g.fill();
  return s;
}

function marigold(outer: string, inner: string, core: string): Sprite {
  const [s, g] = mk(96, 96);
  g.translate(48, 48);
  const rings: [number, number, number][] = [[38, 20, 15], [31, 16, 12], [23, 13, 10], [15, 9, 8]];
  rings.forEach(([r, n, len], ri) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + ri * 0.4;
      g.save();
      g.rotate(a);
      g.translate(0, -r + len * 0.4);
      const gr = g.createLinearGradient(0, -len, 0, len);
      gr.addColorStop(0, ri < 2 ? outer : inner);
      gr.addColorStop(1, inner);
      g.fillStyle = gr;
      g.beginPath();
      g.ellipse(0, 0, 6.2 - ri * 0.5, len, 0, 0, TAU);
      g.fill();
      g.strokeStyle = "rgba(120,50,0,.22)";
      g.lineWidth = 0.8;
      g.stroke();
      g.restore();
    }
  });
  g.fillStyle = core;
  g.beginPath();
  g.arc(0, 0, 5, 0, TAU);
  g.fill();
  return s;
}

function rose(): Sprite {
  const [s, g] = mk(96, 96);
  g.translate(48, 48);
  const shades = ["#7a1420", "#a3162a", "#c41e3a", "#b3182e", "#d62845", "#9c1226"];
  for (let k = 0; k < 7; k++) {
    const r = 38 - k * 5.2;
    g.fillStyle = shades[k % shades.length] as string;
    g.beginPath();
    g.arc(Math.sin(k * 1.9) * 2.4, Math.cos(k * 1.9) * 2.4, r, 0, TAU);
    g.fill();
    g.strokeStyle = "rgba(60,0,10,.5)";
    g.lineWidth = 1.2;
    g.beginPath();
    g.arc(Math.sin(k * 1.9) * 2.4, Math.cos(k * 1.9) * 2.4, r, k * 1.1, k * 1.1 + 3.4);
    g.stroke();
  }
  g.fillStyle = "rgba(255,255,255,.18)";
  g.beginPath();
  g.ellipse(-10, -12, 9, 5, -0.6, 0, TAU);
  g.fill();
  return s;
}

function jasmine(): Sprite {
  const [s, g] = mk(80, 80);
  g.translate(40, 40);
  for (let i = 0; i < 5; i++) {
    g.save();
    g.rotate((i / 5) * TAU);
    const gr = g.createLinearGradient(0, 0, 0, -30);
    gr.addColorStop(0, "#fff3c8");
    gr.addColorStop(1, "#ffffff");
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(0, 0);
    g.bezierCurveTo(10, -8, 9, -26, 0, -33);
    g.bezierCurveTo(-9, -26, -10, -8, 0, 0);
    g.fill();
    g.strokeStyle = "rgba(150,120,60,.35)";
    g.lineWidth = 1;
    g.stroke();
    g.restore();
  }
  g.fillStyle = "#f0b400";
  g.beginPath();
  g.arc(0, 0, 4.2, 0, TAU);
  g.fill();
  return s;
}

function coin(): Sprite {
  const [s, g] = mk(96, 96);
  g.translate(48, 48);
  const rim = g.createLinearGradient(-40, -40, 40, 40);
  rim.addColorStop(0, "#fff0b0");
  rim.addColorStop(0.45, "#e0aa2c");
  rim.addColorStop(1, "#8a5d10");
  g.fillStyle = rim;
  g.beginPath();
  g.arc(0, 0, 44, 0, TAU);
  g.fill();
  g.fillStyle = "#7a520e";
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * TAU;
    g.beginPath();
    g.arc(Math.cos(a) * 39.5, Math.sin(a) * 39.5, 1.7, 0, TAU);
    g.fill();
  }
  const face = g.createRadialGradient(-12, -14, 4, 0, 0, 36);
  face.addColorStop(0, "#ffe27a");
  face.addColorStop(0.55, "#e6b13a");
  face.addColorStop(1, "#b9801c");
  g.fillStyle = face;
  g.beginPath();
  g.arc(0, 0, 34, 0, TAU);
  g.fill();
  g.strokeStyle = "rgba(110,70,8,.65)";
  g.lineWidth = 1.6;
  g.stroke();
  // embossed lotus
  g.fillStyle = "rgba(120,78,8,.55)";
  for (let i = -2; i <= 2; i++) {
    g.save();
    g.rotate(i * 0.5);
    g.beginPath();
    g.ellipse(0, -10, 5.6, 15, 0, 0, TAU);
    g.fill();
    g.restore();
  }
  g.fillStyle = "rgba(255,244,190,.55)";
  for (let i = -2; i <= 2; i++) {
    g.save();
    g.rotate(i * 0.5);
    g.translate(-1.2, -1.6);
    g.beginPath();
    g.ellipse(0, -10, 3.4, 12, 0, 0, TAU);
    g.fill();
    g.restore();
  }
  g.fillStyle = "rgba(255,255,255,.4)";
  g.beginPath();
  g.ellipse(-16, -20, 11, 4, -0.7, 0, TAU);
  g.fill();
  return s;
}

/** The coins that fall in the ceremony are cut from Durga Maa's own picture, so they look exactly like the ones in her hand. */
let coinPics: Sprite[] | null = null;
const COIN_FILL = 0.74; // the coin itself fills about this much of each cell of the picture
export function loadCoinPictures(url: string) {
  if (coinPics || typeof window === "undefined") return;
  const img = new Image();
  img.onload = () => {
    const n = Math.max(1, Math.round(img.width / img.height));
    const cw = Math.floor(img.width / n);
    const list: Sprite[] = [];
    for (let i = 0; i < n; i++) {
      const [c, g] = mk(cw, img.height);
      g.drawImage(img, i * cw, 0, cw, img.height, 0, 0, cw, img.height);
      list.push(c);
    }
    coinPics = list;
  };
  img.src = url;
}

type Kit = { heads: Sprite[]; petals: Sprite[]; coins: Sprite[] };
let kit: Kit | null = null;
function getKit(): Kit {
  if (kit) return kit;
  kit = {
    heads: [
      marigold("#f97316", "#fbbf24", "#9a3412"),
      marigold("#f59e0b", "#fde047", "#a16207"),
      marigold("#ea580c", "#fb923c", "#7c2d12"),
      rose(),
      jasmine(),
      jasmine(),
    ],
    petals: [
      petal("#fb923c", "#ea580c", "rgba(124,45,18,.35)"),
      petal("#fde047", "#eab308", "rgba(133,77,14,.35)"),
      petal("#dc2626", "#7f1d1d", "rgba(69,10,10,.4)"),
      petal("#ffffff", "#ece4cf", "rgba(150,130,90,.5)"),
      petal("#fb923c", "#ea580c", "rgba(124,45,18,.35)"),
      petal("#ffffff", "#f1e9d6", "rgba(150,130,90,.5)"),
    ],
    coins: [coin()],
  };
  return kit;
}

/* ---------------------------------------------------------------- canvas set-up */

function fit(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.5 : 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const g = canvas.getContext("2d") as CanvasRenderingContext2D;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { g, w, h };
}

/* ------------------------------------------------------------------ falling things */

type P = { real: boolean; s: Sprite; x: number; y: number; vx: number; vy: number; ay: number; vmax: number; drag: number; age: number; sway: number; fq: number; ph: number; r: number; vr: number; size: number; flip: number; vf: number; a: number };

export type FallOptions = {
  kind: "flowers" | "coins";
  /** how long new pieces keep arriving */
  duration: number;
  /** pieces per second at the busiest moment */
  rate: number;
  /**
   * Where the pieces come from, in screen pixels (called for every piece, so it can follow something that moves).
   * Without it they fall from above the screen. Coins pour straight down from this point; flowers burst out and drift down.
   */
  from?: () => { x: number; y: number };
  /** Diameter of a coin in pixels (called for every coin). Without it coins get a default size. */
  coinSize?: () => number;
  /** Makes flowers and petals this much bigger or smaller (1 = normal). */
  sizeScale?: number;
  onDone?: () => void;
};

/** Pieces fall from above the screen, tumbling and swaying. Returns a function that stops it at once. */
export function startFall(canvas: HTMLCanvasElement, o: FallOptions): () => void {
  let { g, w, h } = fit(canvas);
  const k = getKit();
  const phone = w < 700;
  const scale = clamp(Math.min(w, h * 1.1) / 820, 0.62, 1.15);
  const cap = phone ? 70 : 150;
  const live: P[] = [];
  let acc = 0;
  let t0 = 0;
  let last = 0;
  let raf = 0;
  let stopped = false;
  const onResize = () => ({ g, w, h } = fit(canvas));
  window.addEventListener("resize", onResize);

  const spawn = () => {
    const coins = o.kind === "coins";
    const real = coins && coinPics && coinPics.length ? coinPics : null;
    const head = !coins && Math.random() < 0.38;
    const s = coins ? (real ? pick(real) : (k.coins[0] as Sprite)) : head ? pick(k.heads) : pick(k.petals);
    const dia = coins ? (o.coinSize ? o.coinSize() * rnd(0.92, 1.1) : rnd(30, 52) * scale) : (head ? rnd(34, 62) : rnd(17, 32)) * scale * (o.sizeScale ?? 1);
    const size = dia / (coins ? (real ? COIN_FILL : 0.92) : 1);
    const src = o.from?.();
    const base: P = {
      real: !!real,
      s,
      x: rnd(-0.02, 1.02) * w,
      y: -size,
      vx: 0,
      vy: (coins ? rnd(300, 520) : head ? rnd(95, 170) : rnd(80, 190)) * (0.8 + scale * 0.25),
      ay: 0,
      vmax: 9999,
      drag: 0,
      age: 0,
      sway: rnd(14, coins ? 26 : 52) * scale,
      fq: rnd(0.6, 1.5),
      ph: rnd(0, TAU),
      r: rnd(0, TAU),
      vr: rnd(-2.2, 2.2),
      size,
      flip: rnd(0, TAU),
      vf: coins ? rnd(3.5, 9) : rnd(1.2, 3.4),
      a: 1,
    };
    if (src) {
      // coming out of a hand
      base.x = src.x + rnd(-5, 5) * scale;
      base.y = src.y;
      base.age = 0;
      if (coins) {
        // coins slip off the fingers and fall straight down, speeding up as they go
        base.vx = rnd(-26, 26) * scale;
        base.vy = rnd(30, 120) * scale;
        base.ay = 1250 * scale;
        base.vmax = 620 * scale;
        base.sway = rnd(2, 7) * scale;
      } else {
        // flowers are thrown up and outwards in blessing, then float down
        base.vx = rnd(-190, 190) * scale;
        base.vy = rnd(-300, -70) * scale;
        base.ay = 560 * scale;
        base.vmax = (head ? 150 : 115) * scale;
        base.drag = 1.5;
        base.sway = rnd(8, 26) * scale;
      }
    }
    live.push(base);
  };

  const frame = (now: number) => {
    if (stopped) return;
    if (!t0) { t0 = now; last = now; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now - t0;
    if (t < o.duration) {
      const x = t / o.duration;
      const env = clamp(t / 700) * (1 - x * x * 0.85);
      acc += o.rate * env * dt;
      while (acc >= 1 && live.length < cap) { spawn(); acc -= 1; }
      if (acc > 3) acc = 0;
    }
    g.clearRect(0, 0, w, h);
    for (let i = live.length - 1; i >= 0; i--) {
      const p = live[i] as P;
      p.age += dt;
      if (p.ay) p.vy = Math.min(p.vmax, p.vy + p.ay * dt);
      p.y += p.vy * dt;
      p.x += p.vx * dt;
      if (p.drag) p.vx *= Math.max(0, 1 - p.drag * dt);
      p.ph += p.fq * dt * TAU * 0.5;
      p.r += p.vr * dt;
      p.flip += p.vf * dt;
      if (p.y - p.size > h || p.x < -120 || p.x > w + 120) { live.splice(i, 1); continue; }
      const x = p.x + Math.sin(p.ph) * p.sway * Math.min(1, p.age / 0.7);
      const f = Math.cos(p.flip);
      g.save();
      g.translate(x, p.y);
      if (o.kind === "coins") {
        g.rotate(Math.sin(p.ph) * 0.35);
        g.scale(Math.max(0.09, Math.abs(f)), 1);
        g.drawImage(p.s, -p.size / 2, -p.size / 2, p.size, p.size);
        if (!p.real && Math.abs(f) > 0.94) {
          g.globalAlpha = (Math.abs(f) - 0.94) * 12;
          g.fillStyle = "#fffbe0";
          g.beginPath();
          g.arc(-p.size * 0.18, -p.size * 0.2, p.size * 0.12, 0, TAU);
          g.fill();
        }
      } else {
        g.rotate(p.r);
        g.scale(1, 0.55 + 0.45 * Math.abs(f));
        g.drawImage(p.s, -p.size / 2, -p.size / 2, p.size, p.size);
      }
      g.restore();
    }
    if (t >= o.duration && live.length === 0) { finish(); return; }
    raf = requestAnimationFrame(frame);
  };
  const finish = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    g.clearRect(0, 0, w, h);
    o.onDone?.();
  };
  raf = requestAnimationFrame(frame);
  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    g.clearRect(0, 0, w, h);
  };
}

/* ------------------------------------------------------------------ water on glass */

/**
 * One clear drop of water on glass, drawn the way a real one looks: almost see-through, a dark edge on the side the
 * light comes from, light gathered at the bottom, and a small bright reflection. (Never a white fill.)
 */
function dropSprite(): Sprite {
  const N = 128;
  const c = N / 2;
  const R = 54;
  const [s, g] = mk(N, N);
  g.save();
  g.beginPath();
  g.arc(c, c, R, 0, TAU);
  g.clip();
  g.fillStyle = "rgba(0,0,0,.07)";
  g.fillRect(0, 0, N, N);
  // a drop acts as a lens: dark where it bends the light away, brighter where it gathers it
  const lens = g.createLinearGradient(c - R * 0.7, c - R * 0.95, c + R * 0.6, c + R);
  lens.addColorStop(0, "rgba(0,0,0,.42)");
  lens.addColorStop(0.42, "rgba(0,0,0,0)");
  lens.addColorStop(0.78, "rgba(255,255,255,.1)");
  lens.addColorStop(1, "rgba(255,255,255,.3)");
  g.fillStyle = lens;
  g.fillRect(0, 0, N, N);
  const gather = g.createRadialGradient(c + R * 0.1, c + R * 0.5, 1, c + R * 0.1, c + R * 0.5, R * 0.62);
  gather.addColorStop(0, "rgba(235,246,255,.5)");
  gather.addColorStop(1, "rgba(235,246,255,0)");
  g.fillStyle = gather;
  g.fillRect(0, 0, N, N);
  g.restore();
  // the outline of the drop is dark all round...
  g.strokeStyle = "rgba(0,0,0,.34)";
  g.lineWidth = 3.4;
  g.beginPath();
  g.arc(c, c, R - 1.7, 0, TAU);
  g.stroke();
  // ...with a thin bright edge only where the light comes through, on the lower right
  g.strokeStyle = "rgba(245,250,255,.8)";
  g.lineWidth = 2.2;
  g.lineCap = "round";
  g.beginPath();
  g.arc(c, c, R - 5, 0.1 * Math.PI, 0.62 * Math.PI);
  g.stroke();
  // the reflection of the light
  g.fillStyle = "rgba(255,255,255,.95)";
  g.beginPath();
  g.ellipse(c - R * 0.36, c - R * 0.4, R * 0.14, R * 0.085, -0.7, 0, TAU);
  g.fill();
  return s;
}

type Drop = { at: number; x: number; y: number; r: number; slide: number; fly: boolean };

export type WaterOptions = {
  /** where the water leaves the coconut, in screen pixels */
  origin: { x: number; y: number };
  span: number;
  hold: number;
  fade: number;
  onDone?: () => void;
};

/**
 * Water flies out of the coconut towards you and lands on the screen as clear drops: a few big ones with lots of small
 * round drops around them. Some run slowly down the glass leaving a trail; after a while everything runs off and dries.
 */
export function startWater(canvas: HTMLCanvasElement, o: WaterOptions): () => void {
  let { g, w, h } = fit(canvas);
  const phone = w < 700;
  const sprite = dropSprite();
  const scale = clamp(Math.min(w, h * 1.2) / 900, 0.62, 1.2);
  const list: Drop[] = [];
  const impacts = phone ? 10 : 16;
  const centres: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < impacts; i++) {
    const big = i < 4;
    centres.push({
      x: (big ? rnd(0.2, 0.8) : rnd(0.06, 0.94)) * w,
      y: (big ? rnd(0.24, 0.76) : rnd(0.08, 0.92)) * h,
      r: (big ? rnd(30, 54) : rnd(16, 36)) * scale,
    });
  }
  // the nearest impacts land first, so the water spreads outwards from the coconut
  const dist = (p: { x: number; y: number }) => Math.hypot(p.x - o.origin.x, p.y - o.origin.y);
  centres.sort((a, b) => dist(a) - dist(b));
  centres.forEach((ct, i) => {
    const at = (i / (impacts - 1)) * o.span + rnd(-40, 40);
    list.push({ at, x: ct.x, y: ct.y, r: ct.r, slide: ct.r > 22 * scale ? rnd(10, 30) * scale : 0, fly: true });
    // a ring of smaller round drops thrown out around each big one
    const n = Math.floor(rnd(16, 28));
    for (let k = 0; k < n; k++) {
      const a = rnd(0, TAU);
      const d = ct.r * rnd(1.3, 3.5);
      const r = Math.max(2.2 * scale, ct.r * rnd(0.06, 0.3) * (1 - (d / (ct.r * 3.5)) * 0.4));
      list.push({ at: at + rnd(0, 140), x: ct.x + Math.cos(a) * d, y: ct.y + Math.sin(a) * d, r, slide: r > 12 * scale ? rnd(6, 22) * scale : 0, fly: false });
    }
  });
  // and a scatter of tiny drops all over the screen
  const tiny = phone ? 150 : 280;
  for (let i = 0; i < tiny; i++) list.push({ at: rnd(0, o.span), x: rnd(0.02, 0.98) * w, y: rnd(0.04, 0.98) * h, r: rnd(2, 8) * scale, slide: 0, fly: false });

  const FLIGHT = 200;
  const lastLand = Math.max(...list.map((d) => d.at)) + FLIGHT;
  const fadeStart = lastLand + o.hold;
  const total = fadeStart + o.fade;
  const onResize = () => ({ g, w, h } = fit(canvas));
  window.addEventListener("resize", onResize);

  let t0 = 0;
  let raf = 0;
  let stopped = false;
  const SZ = 128 / 108; // sprite is a little bigger than the drop it holds
  const frame = (now: number) => {
    if (stopped) return;
    if (!t0) t0 = now;
    const t = now - t0;
    g.clearRect(0, 0, w, h);
    const fadeT = Math.max(0, t - fadeStart);
    const fadeK = clamp(fadeT / o.fade);
    const gone = 1 - fadeK;
    const first = Math.min(...list.map((d) => d.at));

    // a faint wet sheen over the whole screen while the water is there
    if (t >= first) {
      g.fillStyle = `rgba(215,232,250,${0.045 * clamp((t - first) / 400) * gone})`;
      g.fillRect(0, 0, w, h);
    }
    // a quick, soft burst of light where the water leaves the coconut
    const fl = clamp(1 - (t - first) / 300);
    if (fl > 0 && t >= first) {
      const gr = g.createRadialGradient(o.origin.x, o.origin.y, 0, o.origin.x, o.origin.y, Math.max(w, h) * 0.45);
      gr.addColorStop(0, `rgba(225,240,255,${0.16 * fl})`);
      gr.addColorStop(1, "rgba(225,240,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
    }

    for (const d of list) {
      const lt = t - d.at;
      if (lt < 0) continue;
      if (d.fly && lt < FLIGHT) {
        // a drop of water rushing at the screen
        const u = lt / FLIGHT;
        const e = u * u;
        const x = o.origin.x + (d.x - o.origin.x) * e;
        const y = o.origin.y + (d.y - o.origin.y) * e - Math.sin(u * Math.PI) * 28;
        const r = 3 + e * d.r * 0.55;
        g.globalAlpha = 0.9;
        g.drawImage(sprite, x - r * SZ, y - r * SZ, r * 2 * SZ, r * 2 * SZ);
        g.globalAlpha = 1;
        continue;
      }
      const k = d.fly ? lt - FLIGHT : lt;
      const pop = easeOutBack(clamp(k / 240));
      const a = clamp(k / 60) * gone;
      if (a <= 0.01) continue;
      // running down the glass: slowly at first, quicker as everything dries away
      const run = d.slide ? Math.pow(k / 1000, 1.15) * d.slide + Math.pow(fadeT / 1000, 2) * 150 * scale : Math.pow(fadeT / 1000, 2) * 40 * scale;
      const r = d.r * (0.25 + 0.75 * pop) * (1 - 0.12 * fadeK);
      const stretch = 1 + Math.min(0.45, run / (d.r * 7));
      g.globalAlpha = a;
      const trailLen = run - r * stretch * 0.75; // the trail ends where the drop begins, never inside it
      if (trailLen > 3 && d.slide) {
        // the thin wet trail the drop leaves behind it: narrow where it started, wider at the drop
        const wd = Math.max(1.1, r * 0.4);
        const tr = g.createLinearGradient(0, d.y, 0, d.y + trailLen);
        tr.addColorStop(0, "rgba(235,246,255,0)");
        tr.addColorStop(1, "rgba(235,246,255,0.2)");
        g.fillStyle = tr;
        g.beginPath();
        g.moveTo(d.x - wd * 0.15, d.y);
        g.lineTo(d.x + wd * 0.15, d.y);
        g.lineTo(d.x + wd, d.y + trailLen);
        g.lineTo(d.x - wd, d.y + trailLen);
        g.closePath();
        g.fill();
      }
      g.drawImage(sprite, d.x - r * SZ, d.y + run - r * stretch * SZ, r * 2 * SZ, r * 2 * stretch * SZ);
    }
    g.globalAlpha = 1;
    if (t >= total) { finish(); return; }
    raf = requestAnimationFrame(frame);
  };
  const finish = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    g.clearRect(0, 0, w, h);
    o.onDone?.();
  };
  raf = requestAnimationFrame(frame);
  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    g.clearRect(0, 0, w, h);
  };
}

/* ------------------------------------------------------------------ scroll tour */

/**
 * Scrolls steadily to the bottom of the page and back to the top, at a pace that lets people take the page in.
 * Speeds are in pixels per second, so a longer page takes longer. Any touch, wheel or key press stops it.
 */
export function scrollTour(opts: { downSpeed: number; upSpeed: number; pause: number; onDone?: () => void }): () => void {
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  const ease = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x); // gentle start and stop, no sudden rush in the middle
  let raf = 0;
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    root.style.scrollBehavior = prev;
    ["wheel", "touchstart", "keydown", "mousedown"].forEach((e) => window.removeEventListener(e, stop));
    opts.onDone?.();
  };
  ["wheel", "touchstart", "keydown", "mousedown"].forEach((e) => window.addEventListener(e, stop, { passive: true }));
  const max = () => Math.max(0, root.scrollHeight - window.innerHeight);
  const m0 = max();
  const down = clamp((m0 / opts.downSpeed) * 1000 * 1.1, 6000, 90000);
  const up = clamp((m0 / opts.upSpeed) * 1000 * 1.1, 5000, 60000);
  let t0 = 0;
  const frame = (now: number) => {
    if (stopped) return;
    if (!t0) t0 = now;
    const t = now - t0;
    const m = max();
    if (t < down) window.scrollTo(0, m * ease(t / down));
    else if (t < down + opts.pause) window.scrollTo(0, m);
    else if (t < down + opts.pause + up) window.scrollTo(0, m * (1 - ease((t - down - opts.pause) / up)));
    else { window.scrollTo(0, 0); stop(); return; }
    raf = requestAnimationFrame(frame);
  };
  window.scrollTo(0, 0);
  raf = requestAnimationFrame(frame);
  return stop;
}
