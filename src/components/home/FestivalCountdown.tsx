"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/lang";
import { festivals } from "@/lib/content";
import { leadTimeHoursFor, leadTimeText } from "@/lib/products";
import { Reveal } from "../ui";
import { Lotus } from "../ornaments";

const startOfDay = (iso: string) => new Date(`${iso}T00:00:00`).getTime();

/** "Next festival in …" with a live countdown. Dates are edited in the CMS: Website Content, Festival countdown. */
export default function FestivalCountdown() {
  const { t, tf, lang } = useLang();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (now === null) return null;

  const today = new Date(now);
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const next = [...festivals].filter((f) => startOfDay(f.date) >= midnight).sort((a, b) => startOfDay(a.date) - startOfDay(b.date))[0];
  if (!next) return null;

  const left = Math.max(0, startOfDay(next.date) - now);
  const isToday = startOfDay(next.date) === midnight;
  const parts = [
    [Math.floor(left / 86400000), t("dDays")],
    [Math.floor(left / 3600000) % 24, t("dHours")],
    [Math.floor(left / 60000) % 60, t("dMins")],
    [Math.floor(left / 1000) % 60, t("dSecs")],
  ] as const;
  const lead = leadTimeText(leadTimeHoursFor([next.category]), lang);

  return (
    <Reveal className="mx-auto max-w-4xl px-4">
      <div className="card p-6 text-center md:p-8">
        <Lotus className="mx-auto h-6 w-10 text-gold" />
        <p className="mt-1 text-xs font-medium uppercase tracking-[.3em] text-gold3">{t("festTag")}</p>
        <h3 className="foil-title text-4xl md:text-5xl">{lang === "hi" ? next.nameHi : next.name}</h3>
        {isToday ? (
          <p className="mt-4 font-display text-3xl text-maroon">{t("festToday")}</p>
        ) : (
          <div className="mt-5 grid grid-cols-4 gap-2 md:gap-4" role="timer" aria-live="off">
            {parts.map(([n, label]) => (
              <div key={label} className="metal rounded-xl border border-gold px-1 py-3 md:py-4">
                <p className="gold-text font-display text-4xl leading-none md:text-5xl">{String(n).padStart(2, "0")}</p>
                <p className="mt-1 text-[11px] uppercase tracking-widest md:text-xs">{label}</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-sm opacity-90">{tf("festPrep", { lead })}</p>
        <Link href={`/products/${next.category ? `?cat=${encodeURIComponent(next.category)}` : ""}`} className="btn mt-5">{t("festShop")}</Link>
      </div>
    </Reveal>
  );
}
