"use client";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/lang";
import { aartiPhase, dayOfYear, type AartiPhase } from "@/lib/aarti";
import { mantras } from "@/lib/content";
import { Reveal } from "../ui";
import { SacredDivider } from "../ornaments";
import { ParallaxMandala } from "./effects";

/** One mantra each day, in turn. Edit the list in the CMS: Website Content, Daily mantras. */
export default function MantraOfDay() {
  const { t, lang } = useLang();
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<AartiPhase>("");
  useEffect(() => {
    setI(dayOfYear() % mantras.length);
    setPhase(aartiPhase());
  }, []);
  const m = mantras[i];
  return (
    <section className="relative overflow-hidden px-4 py-24 text-center">
      <ParallaxMandala />
      <Reveal className="relative mx-auto max-w-3xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-[.3em] text-gold3">{t("mantraTag")}</p>
        <p className="font-display text-3xl leading-relaxed text-maroon md:text-5xl md:leading-relaxed" style={{ whiteSpace: "pre-line" }}>{m.sanskrit}</p>
        <SacredDivider kind="om" className="my-5" />
        <p className="mx-auto max-w-xl text-lg italic">{lang === "hi" ? m.hi : m.en}</p>
        {phase && <p className="chip mt-6 !border-marigold/70">🪔 {phase === "morning" ? t("aartiMorning") : t("aartiEvening")}</p>}
      </Reveal>
    </section>
  );
}
