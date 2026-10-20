"use client";
import { useState } from "react";
import { useLang } from "@/lib/lang";
import { openWhatsApp } from "@/lib/external";
import { site } from "@/lib/site";
import { digitsOnly } from "@/lib/validation";
import { Icon } from "../ornaments";

type Result = null | { kind: "ok" | "no" | "ask" | "bad"; pin: string };

/**
 * "Do you deliver to me?" checker. While the CMS pincode list is empty it simply hands the question
 * to WhatsApp, so it never claims anything the shop has not confirmed.
 */
export default function PincodeCheck() {
  const { t, tf } = useLang();
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<Result>(null);

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pin)) return setResult({ kind: "bad", pin });
    if (site.deliveryPincodes.length === 0) return setResult({ kind: "ask", pin });
    setResult({ kind: site.deliveryPincodes.includes(pin) ? "ok" : "no", pin });
  };
  const ask = () => openWhatsApp(tf("pinMsg", { pin: result?.pin ?? pin }));

  return (
    <form className="mx-auto max-w-md text-left" onSubmit={check} noValidate>
      <label htmlFor="pincode" className="mb-2 flex items-center gap-2 font-medium text-maroon"><Icon name="truck" /> {t("deliverQ")}</label>
      <div className="flex gap-2">
        <input id="pincode" className="inp" inputMode="numeric" autoComplete="postal-code" maxLength={6} placeholder={t("pinPh")}
          value={pin} aria-invalid={result?.kind === "bad" ? true : undefined} aria-describedby="pincode-result"
          onChange={(e) => { setPin(digitsOnly(e.target.value)); setResult(null); }} />
        <button type="submit" className="btn btn-sm">{t("check")}</button>
      </div>
      <p id="pincode-result" className="mt-2 min-h-6 text-sm" role="status" aria-live="polite">
        {result?.kind === "bad" && <span className="text-ruby">{t("pinBad")}</span>}
        {result?.kind === "ok" && <span className="text-emerald">{tf("pinOk", { pin: result.pin })}</span>}
        {result?.kind === "no" && (<>{tf("pinNo", { pin: result.pin })} <button type="button" className="underline" onClick={ask}>{t("askUs")}</button></>)}
        {result?.kind === "ask" && (<>{t("pinAsk")} <button type="button" className="underline" onClick={ask}>{tf("confirmPin", { pin: result.pin })}</button></>)}
      </p>
    </form>
  );
}
