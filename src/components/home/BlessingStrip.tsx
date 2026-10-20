"use client";
import { useLang } from "@/lib/lang";
import { Reveal } from "../ui";
import { Swastika } from "../ornaments";

/** A slim band: every kit is packed with a prayer. */
export default function BlessingStrip() {
  const { t } = useLang();
  return (
    <Reveal>
      <div className="blessing">
        <Swastika className="h-8 w-8 text-gold" />
        <p className="font-display text-2xl text-maroon md:text-3xl">{t("blessingA")}</p>
        <span className="chip !bg-transparent">{t("blessingB")}</span>
      </div>
    </Reveal>
  );
}
