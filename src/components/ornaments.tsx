type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const Lotus = ({ className }: P) => (
  <svg viewBox="0 0 64 40" className={className} {...base} aria-hidden>
    <path d="M32 3C41 13 41 27 32 37C23 27 23 13 32 3Z" fill="currentColor" fillOpacity=".3" />
    <path d="M32 37C20 35 10 27 8 14C20 16 28 25 32 37Z" fill="currentColor" fillOpacity=".15" />
    <path d="M32 37C44 35 54 27 56 14C44 16 36 25 32 37Z" fill="currentColor" fillOpacity=".15" />
    <path d="M32 37C16 39 4 35 0 27C12 25 24 29 32 37Z" />
    <path d="M32 37C48 39 60 35 64 27C52 25 40 29 32 37Z" />
  </svg>
);

export const Diya = ({ className, lit = true }: P & { lit?: boolean }) => (
  <svg viewBox="0 0 48 48" className={className} {...base} aria-hidden>
    <path className="flame" d="M24 3c5 7 6 11 0 16-6-5-5-9 0-16z" fill="#F7C948" stroke="#F08A1C" style={{ opacity: lit ? 1 : 0, transition: "opacity .6s" }} />
    <path d="M5 25h38c0 11-8 19-19 19S5 36 5 25z" fill="currentColor" fillOpacity=".15" />
    <path d="M13 45h22M12 31c4 3 8 4 12 4s8-1 12-4" />
  </svg>
);

export const Kalash = ({ className }: P) => (
  <svg viewBox="0 0 48 48" className={className} {...base} aria-hidden>
    <ellipse cx="24" cy="9" rx="6" ry="5" fill="currentColor" fillOpacity=".25" />
    <path d="M10 12c5-4 9-2 14 0M38 12c-5-4-9-2-14 0" />
    <path d="M18 15h12v4H18zM16 19h16c5 7 6 13 2 20-1 3-4 5-10 5s-9-2-10-5c-4-7-3-13 2-20z" fill="currentColor" fillOpacity=".15" />
    <path d="M14 29h20" />
  </svg>
);

export const Leaf = ({ className }: P) => (
  <svg viewBox="0 0 48 48" className={className} {...base} aria-hidden>
    <path d="M8 40C8 20 22 8 40 8c0 20-12 32-30 32z" fill="currentColor" fillOpacity=".15" />
    <path d="M8 40L30 18" />
  </svg>
);

export const Gift = ({ className }: P) => (
  <svg viewBox="0 0 48 48" className={className} {...base} aria-hidden>
    <rect x="8" y="21" width="32" height="21" rx="2" fill="currentColor" fillOpacity=".15" />
    <path d="M6 14h36v7H6zM24 14v28M24 14c-6-9-15-4-10 0M24 14c6-9 15-4 10 0" />
  </svg>
);

export const Trishul = ({ className }: P) => (
  <svg viewBox="0 0 48 48" className={className} {...base} aria-hidden>
    <path d="M24 5v40M24 5l-3 6h6zM11 9c0 12 6 18 13 18s13-6 13-18M11 9l-2 5M37 9l2 5M19 38h10" />
  </svg>
);

export const Flower = ({ className }: P) => (
  <svg viewBox="-24 -24 48 48" className={className} {...base} aria-hidden>
    {Array.from({ length: 8 }).map((_, i) => <ellipse key={i} transform={`rotate(${i * 45})`} cx="0" cy="-12" rx="5" ry="10" fill="currentColor" fillOpacity=".15" />)}
    <circle r="4" fill="currentColor" fillOpacity=".5" />
  </svg>
);

export const Mandala = ({ className }: P) => (
  <svg viewBox="-100 -100 200 200" className={className} fill="none" stroke="currentColor" strokeWidth=".9" aria-hidden>
    {Array.from({ length: 16 }).map((_, i) => <path key={i} transform={`rotate(${i * 22.5})`} d="M0 -34C10 -52 10 -72 0 -94C-10 -72 -10 -52 0 -34Z" />)}
    {Array.from({ length: 8 }).map((_, i) => <ellipse key={`e${i}`} transform={`rotate(${i * 45})`} cx="0" cy="-22" rx="6" ry="14" />)}
    {Array.from({ length: 24 }).map((_, i) => <circle key={`d${i}`} transform={`rotate(${i * 15}) translate(0 -97)`} r="1.4" fill="currentColor" />)}
    <circle r="99" /><circle r="34" /><circle r="9" />
  </svg>
);

export const Phone = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

/* ---------- Palace & temple ornaments ---------- */

/** Cusped (scalloped) palace arch, in 0..1 coordinates so it stretches to any size. */
export const JH_PATH =
  "M0 1V0.46A0.07 0.12 0 0 1 0.08 0.30A0.08 0.12 0 0 1 0.2 0.16A0.09 0.12 0 0 1 0.36 0.06Q0.44 0.03 0.5 0Q0.56 0.03 0.64 0.06A0.09 0.12 0 0 1 0.8 0.16A0.08 0.12 0 0 1 0.92 0.30A0.07 0.12 0 0 1 1 0.46V1Z";

/** Render once (in the layout): lets any element use clip-path:url(#jh-clip). */
export const JharokhaDefs = () => (
  <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
    <defs><clipPath id="jh-clip" clipPathUnits="objectBoundingBox"><path d={JH_PATH} /></clipPath></defs>
  </svg>
);

/** A jharokha: a palace window with a scalloped arch and a double gold frame. Give it a width and a height. */
export function Jharokha({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`jh ${className}`}>
      <div className="jh-in">{children}</div>
      <svg className="jh-line" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden>
        <path d={JH_PATH} vectorEffect="non-scaling-stroke" />
        <path d={JH_PATH} vectorEffect="non-scaling-stroke" className="in2" transform="translate(.04 .06) scale(.92 .94)" />
      </svg>
    </div>
  );
}

/** Small arch with a lotus, used to crown section headings. */
export const ArchOrnament = ({ className = "" }: P) => (
  <div className={`relative mx-auto h-12 w-14 ${className}`} aria-hidden>
    <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={JH_PATH} vectorEffect="non-scaling-stroke" />
    </svg>
    <Lotus className="absolute bottom-1.5 left-1/2 h-4 w-7 -translate-x-1/2" />
  </div>
);

/** Auspicious swastika (clockwise, as used in Hindu worship). */
export const Swastika = ({ className }: P) => (
  <svg viewBox="0 0 48 48" className={className} {...base} strokeWidth={3} aria-hidden>
    <path d="M24 6V42M6 24H42M24 6H36M42 24V36M24 42H12M6 24V12" />
    <circle cx="14" cy="14" r="1.6" fill="currentColor" stroke="none" /><circle cx="34" cy="14" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="34" cy="34" r="1.6" fill="currentColor" stroke="none" /><circle cx="14" cy="34" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);

/** A line, a sacred motif (kumkum tilak, Om or swastika) and a line. */
export function SacredDivider({ kind = "tilak", className = "" }: { kind?: "tilak" | "om" | "swastika"; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 text-gold ${className}`} aria-hidden>
      <span className="rule" />
      {kind === "tilak" && (
        <svg viewBox="0 0 24 24" className="h-5 w-5"><circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.2" /><circle cx="12" cy="12" r="5.5" fill="#A32A35" /></svg>
      )}
      {kind === "om" && <span className="gold-text font-display text-4xl leading-none">ॐ</span>}
      {kind === "swastika" && <Swastika className="h-7 w-7" />}
      <span className="rule r" />
    </div>
  );
}

/** Temple-gate (gopuram) silhouette that rises out of the footer. */
export function TempleSkyline({ className = "" }: P) {
  const small = [10, 90, 170, 250, 330], medium = [410];
  return (
    <svg viewBox="0 0 1200 170" preserveAspectRatio="xMidYMax slice" className={className} fill="currentColor" aria-hidden>
      <defs>
        <symbol id="gop" viewBox="0 0 100 120">
          <path d="M8 100h84v20H8z" />
          <path d="M10 100L16 84H84L90 100ZM18 84L24 70H76L82 84ZM26 70L31 57H69L74 70ZM33 57L37 45H63L67 57ZM39 45L43 34H57L61 45Z" />
          <path d="M42 34Q50 14 58 34Z" />
          <rect x="49" y="6" width="2" height="14" /><circle cx="50" cy="5" r="3.2" />
        </symbol>
      </defs>
      <rect y="160" width="1200" height="10" />
      {small.map((x) => (<g key={x}><use href="#gop" x={x} y={93} width={64} height={77} /><use href="#gop" x={1200 - x - 64} y={93} width={64} height={77} /></g>))}
      {medium.map((x) => (<g key={x}><use href="#gop" x={x} y={55} width={96} height={115} /><use href="#gop" x={1200 - x - 96} y={55} width={96} height={115} /></g>))}
      <use href="#gop" x={530} y={2} width={140} height={168} />
    </svg>
  );
}

const ICONS: Record<string, string> = {
  check: "M20 6 9 17l-5-5", minus: "M5 12h14", plus: "M12 5v14M5 12h14", x: "M18 6 6 18M6 6l12 12",
  trash: "M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6", copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  left: "M15 18l-6-6 6-6", right: "M9 18l6-6-6-6", arrow: "M5 12h14M13 6l6 6-6 6",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3",
  truck: "M1 4h15v12H1zM16 8h4l3 3v5h-7zM6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  qr: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14v3M14 20h3M20 20h1",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  bellOff: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0M3 3l18 18",
  cart: "M6 6h15l-2 9H8zM6 6 5 3H2M9 20.5h.01M18 20.5h.01",
  warn: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  phone: "M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2",
  gift: "M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
};
export const Icon = ({ name, className = "h-5 w-5" }: { name: keyof typeof ICONS; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden><path d={ICONS[name]} /></svg>
);
