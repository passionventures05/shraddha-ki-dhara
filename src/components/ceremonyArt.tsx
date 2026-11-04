"use client";
/**
 * Each piece of the ceremony tries to load its real image first (see ASSETS in lib/ceremony.ts).
 * If that file isn't there yet, a drawn stand-in is shown instead, so the ceremony always works.
 */
import { useState, type ReactNode } from "react";

export function Art({ src, fallback, className = "", width, height }: { src: string; fallback: ReactNode; className?: string; width: number; height: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className={className}>{fallback}</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={src} width={width} height={height} alt="" draggable={false} decoding="async" onError={() => {
    console.warn(`[ceremony] ${src} not found, using a drawn stand-in`);
    setFailed(true);
  }} />;
}

const MANGO = "M0 0 C16 -14 24 -46 0 -92 C-24 -46 -16 -14 0 0 Z";

export function KalashArt() {
  return (
    <svg viewBox="0 0 200 300" width="100%" height="100%" aria-hidden focusable="false" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="kcu" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a3510" /><stop offset=".3" stopColor="#e8935a" /><stop offset=".55" stopColor="#c8622a" /><stop offset="1" stopColor="#6a2b0c" />
        </linearGradient>
        <linearGradient id="klf" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1f5a1c" /><stop offset="1" stopColor="#5fae3c" />
        </linearGradient>
        <radialGradient id="kco" cx=".38" cy=".32" r=".8">
          <stop offset="0" stopColor="#a87442" /><stop offset=".6" stopColor="#6b4220" /><stop offset="1" stopColor="#3b2210" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="286" rx="62" ry="9" fill="rgba(0,0,0,.35)" />
      {[-46, -23, 0, 23, 46].map((a, i) => (
        <g key={a} transform={`translate(100 118) rotate(${a})`}>
          <path d={MANGO} fill="url(#klf)" stroke="#173f14" strokeWidth="1.2" transform={`scale(${i === 2 ? 0.82 : 1})`} />
          <path d="M0 -4 V-78" stroke="#a6d98a" strokeOpacity=".55" strokeWidth="1.2" />
        </g>
      ))}
      <circle cx="100" cy="76" r="34" fill="url(#kco)" />
      {Array.from({ length: 14 }, (_, i) => (
        <path key={i} d={`M${100 + Math.cos(i * 0.9) * 8} ${76 + Math.sin(i * 0.9) * 8} L${100 + Math.cos(i * 0.9) * 33} ${76 + Math.sin(i * 0.9) * 33}`} stroke="#2a170a" strokeOpacity=".35" strokeWidth="1.4" />
      ))}
      <path d="M92 44 q8 -14 16 0 q-8 -4 -16 0Z" fill="#7b5a30" />
      <circle cx="100" cy="76" r="3.4" fill="#c1121f" />
      <ellipse cx="100" cy="127" rx="38" ry="9" fill="#6a2b0c" />
      <path d="M68 128 C58 129 56 142 66 150 C30 168 28 246 70 272 L130 272 C172 246 170 168 134 150 C144 142 142 129 132 128 Z" fill="url(#kcu)" stroke="#5a230a" strokeWidth="1.5" />
      <path d="M62 154 H138" stroke="#c1121f" strokeWidth="7" /><path d="M62 154 H138" stroke="#f2c230" strokeWidth="2" strokeDasharray="5 5" />
      <path d="M40 206 C70 216 130 216 160 206" stroke="#f0cf7a" strokeWidth="5" fill="none" strokeLinecap="round" /><path d="M43 214 C72 224 128 224 157 214" stroke="#b8862a" strokeWidth="2" fill="none" />
      <g transform="translate(100 184)" stroke="#c1121f" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M-12 0H12M0 -12V12M0 -12H10M12 0V10M0 12H-10M-12 0V-10" />
      </g>
      <path d="M52 188 C48 212 56 244 80 262" stroke="rgba(255,255,255,.28)" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function NutWholeArt() {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden focusable="false" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <radialGradient id="nw" cx=".36" cy=".3" r=".85">
          <stop offset="0" stopColor="#a87442" /><stop offset=".55" stopColor="#6b4220" /><stop offset="1" stopColor="#32190a" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="112" rx="34" ry="5" fill="rgba(0,0,0,.28)" />
      <ellipse cx="60" cy="62" rx="48" ry="50" fill="url(#nw)" />
      {Array.from({ length: 26 }, (_, i) => {
        const a = (i / 26) * Math.PI * 2;
        return <path key={i} d={`M${60 + Math.cos(a) * 12} ${62 + Math.sin(a) * 12} L${60 + Math.cos(a) * 46} ${62 + Math.sin(a) * 47}`} stroke="#241206" strokeOpacity=".32" strokeWidth="1.3" />;
      })}
      <path d="M52 14 q8 -12 16 0 q-8 -3 -16 0Z" fill="#7b5a30" />
      <circle cx="52" cy="34" r="3.6" fill="#241206" /><circle cx="68" cy="34" r="3.6" fill="#241206" /><circle cx="60" cy="44" r="3.6" fill="#241206" />
      <circle cx="60" cy="68" r="5.5" fill="#c1121f" />
      <ellipse cx="38" cy="40" rx="10" ry="5" fill="rgba(255,255,255,.18)" transform="rotate(-35 38 40)" />
    </svg>
  );
}

export function NutHalfArt({ side }: { side: "l" | "r" }) {
  return (
    <svg viewBox="0 0 120 90" width="100%" height="100%" aria-hidden focusable="false" style={{ display: "block", overflow: "visible", transform: side === "r" ? "scaleX(-1)" : undefined }}>
      <defs>
        <radialGradient id={`nh${side}`} cx=".4" cy=".25" r=".9">
          <stop offset="0" stopColor="#9a6a3a" /><stop offset=".6" stopColor="#5e3a1b" /><stop offset="1" stopColor="#2e1809" />
        </radialGradient>
        <linearGradient id={`nq${side}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3fbff" /><stop offset="1" stopColor="#b9dcee" />
        </linearGradient>
      </defs>
      <path d="M6 38 C6 84 114 84 114 38 Z" fill={`url(#nh${side})`} stroke="#2e1809" strokeOpacity=".6" />
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d={`M${14 + i * 6.4} 44 L${60 + (i - 8) * 4.6} 80`} stroke="#1f1006" strokeOpacity=".3" strokeWidth="1.2" />
      ))}
      <ellipse cx="60" cy="38" rx="55" ry="16" fill="#fffaf0" stroke="#d9cdb4" strokeWidth="1.4" />
      <ellipse cx="60" cy="38" rx="44" ry="11" fill={`url(#nq${side})`} />
      <ellipse cx="48" cy="35" rx="14" ry="3" fill="rgba(255,255,255,.85)" />
      <path d="M8 38 q-4 8 0 12" stroke="#7b5a30" strokeWidth="2" fill="none" /><path d="M112 38 q4 8 0 12" stroke="#7b5a30" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function ThaliArt() {
  const flowers: [number, number, string][] = [
    [46, 112, "#f59e0b"], [66, 96, "#ea580c"], [92, 88, "#dc2626"], [118, 84, "#fde047"], [150, 82, "#ffffff"], [182, 84, "#f59e0b"], [208, 88, "#dc2626"], [234, 96, "#ea580c"], [254, 112, "#fde047"],
    [58, 132, "#ffffff"], [246, 132, "#ffffff"], [78, 150, "#dc2626"], [222, 150, "#f59e0b"], [112, 160, "#fde047"], [150, 164, "#ea580c"], [188, 160, "#dc2626"],
  ];
  return (
    <svg viewBox="0 0 300 220" width="100%" height="100%" aria-hidden focusable="false" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="tp" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff0b0" /><stop offset=".5" stopColor="#d9a52f" /><stop offset="1" stopColor="#8a5d10" />
        </linearGradient>
        <radialGradient id="tf" cx=".5" cy=".6" r=".6">
          <stop offset="0" stopColor="#fff7d6" /><stop offset=".45" stopColor="#ffc93c" /><stop offset="1" stopColor="#ff7a00" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="190" rx="118" ry="14" fill="rgba(0,0,0,.28)" />
      <ellipse cx="150" cy="140" rx="138" ry="66" fill="#7a520e" />
      <ellipse cx="150" cy="128" rx="138" ry="66" fill="url(#tp)" stroke="#6b4a10" strokeWidth="1.5" />
      <ellipse cx="150" cy="130" rx="116" ry="52" fill="#e9bd4a" stroke="#a87a1c" strokeWidth="1.4" />
      <ellipse cx="150" cy="132" rx="104" ry="45" fill="#f3d37a" opacity=".55" />
      {Array.from({ length: 44 }, (_, i) => {
        const a = (i / 44) * Math.PI * 2;
        return <circle key={i} cx={150 + Math.cos(a) * 127} cy={128 + Math.sin(a) * 58} r="2" fill="#fff0b0" />;
      })}
      {flowers.map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <ellipse rx="13" ry="9" fill={c} stroke="rgba(90,40,0,.4)" />
          <ellipse rx="7" ry="5" fill="rgba(255,255,255,.28)" />
        </g>
      ))}
      <ellipse cx="150" cy="124" rx="34" ry="14" fill="#7a520e" />
      <path d="M118 112 C118 138 182 138 182 112 Z" fill="url(#tp)" stroke="#6b4a10" />
      <ellipse cx="150" cy="112" rx="32" ry="10" fill="#c1121f" />
      <ellipse cx="150" cy="111" rx="30" ry="8" fill="#f6dd8a" opacity=".5" />
      <ellipse cx="150" cy="106" rx="58" ry="46" fill="url(#tf)" opacity=".7" />
      <path className="cs-flame" d="M150 66 C158 80 164 90 150 106 C136 90 142 80 150 66 Z" fill="#ffd34a" stroke="#ff8a00" strokeWidth="1.2" />
      <path className="cs-flame" d="M150 86 C154 92 155 98 150 104 C145 98 146 92 150 86 Z" fill="#fffbe6" />
    </svg>
  );
}
