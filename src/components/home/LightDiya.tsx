"use client";
import { useState } from "react";
import { useLang } from "@/lib/lang";
import { ringBell } from "@/lib/sound";
import { Diya } from "../ornaments";

/** Tap to light the diya. It glows warmly, and rings the temple bell if the visitor has switched sound on. */
export default function LightDiya() {
  const { t } = useLang();
  const [lit, setLit] = useState(false);
  return (
    <div className="text-center">
      <button type="button" onClick={() => { setLit((v) => !v); if (!lit) ringBell(); }} aria-pressed={lit} aria-label={t("diyaAria")} className={`lightdiya ${lit ? "lit" : ""}`}>
        <span className="halo" aria-hidden />
        <Diya lit={lit} className="relative h-28 w-28 text-gold2" />
      </button>
      <p className="mt-3 font-display text-2xl text-gold2" aria-live="polite">{lit ? t("diyaLit") : t("diyaTap")}</p>
    </div>
  );
}
