"use client";
import { useEffect, useRef } from "react";
import { aartiPhase } from "@/lib/aarti";
import { Mandala } from "../ornaments";

/** Gives the whole site a soft, warm glow at the traditional aarti hours (early morning and dusk). */
export function AartiGlow() {
  useEffect(() => {
    const apply = () => {
      const p = aartiPhase();
      if (p) document.documentElement.dataset.aarti = p;
      else delete document.documentElement.dataset.aarti;
    };
    apply();
    const id = window.setInterval(apply, 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);
  return null;
}

/** A mandala that turns slowly and drifts a little as you scroll. Put it inside a `relative overflow-hidden` section. */
export function ParallaxMandala({ className = "h-[34rem] w-[34rem] text-gold opacity-20" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const box = el.parentElement?.getBoundingClientRect();
      if (!box) return;
      el.style.setProperty("--py", `${-(box.top + box.height / 2 - window.innerHeight / 2) * 0.15}px`);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="pmandala" aria-hidden><Mandala className={`spin-slow ${className}`} /></div>;
}
