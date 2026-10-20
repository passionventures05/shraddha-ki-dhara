"use client";
import { useState } from "react";
import { useLang } from "@/lib/lang";
import { useCart } from "@/lib/useCart";
import { builderItems, inr } from "@/lib/products";
import { openWhatsApp } from "@/lib/external";
import { ringBell } from "@/lib/sound";
import { validatePhoneNumber, digitsOnly } from "@/lib/validation";
import { Heading } from "../ui";
import { Icon } from "../ornaments";

export default function SpecialOrder() {
  const { t, lang } = useLang();
  const { setItem } = useCart();
  const [tab, setTab] = useState<"b" | "e">("b");
  const [sel, setSel] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [e, setE] = useState({ name: "", phone: "", occasion: "Wedding", qty: "", details: "" });
  const chosen = builderItems.filter((i) => sel.includes(i.id));
  const total = chosen.reduce((s, i) => s + i.price, 0);
  const tabCls = (on: boolean) => `rounded-full border border-gold px-6 py-2 ${on ? "metal !text-cream" : "bg-cream2"}`;

  const addKit = () => {
    const label = chosen.map((i) => i.en).join(", ");
    setItem({ key: `custom|${[...sel].sort().join(",")}`, name: "Custom puja kit", nameHi: "कस्टम पूजा किट", label, unitPrice: total }, 1);
    ringBell();
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };
  const sendEnquiry = () => {
    if (!e.name.trim()) return setErr(t("eName"));
    if (!validatePhoneNumber(e.phone.trim())) return setErr(t("ePhone"));
    setErr("");
    openWhatsApp(`🪔 *Enquiry*\n${e.name} (+91 ${e.phone})\nOccasion: ${e.occasion}\nQty: ${e.qty}\n${e.details}`);
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <Heading eyebrow={t("special")} title={t("special")} sub={t("sub")} />
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        <button type="button" className={tabCls(tab === "b")} onClick={() => setTab("b")}>{t("builder")}</button>
        <button type="button" className={tabCls(tab === "e")} onClick={() => setTab("e")}>{t("enquiry")}</button>
      </div>
      {tab === "b" ? (
        <div className="card p-6">
          <div className="grid gap-2 sm:grid-cols-2">
            {builderItems.map((i) => (
              <label key={i.id} className="flex items-center justify-between rounded-xl border border-gold/50 bg-cream2 px-3 py-2">
                <span className="flex items-center gap-2"><input type="checkbox" className="accent-emerald" checked={sel.includes(i.id)} onChange={() => setSel((p) => p.includes(i.id) ? p.filter((x) => x !== i.id) : [...p, i.id])} />{lang === "hi" ? i.hi : i.en}</span>
                <span>{inr(i.price)}</span>
              </label>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span className="font-display text-3xl text-maroon">{t("total")}: {inr(total)}</span>
            <button type="button" className="btn" disabled={!chosen.length} onClick={addKit}>{done ? <><Icon name="check" className="h-5 w-5" /> {t("added")}</> : t("addKit")}</button>
          </div>
        </div>
      ) : (
        <div className="card grid gap-4 p-6">
          <input className="inp" placeholder={t("name")} value={e.name} onChange={(x) => setE({ ...e, name: x.target.value })} />
          <input className="inp" inputMode="numeric" maxLength={10} placeholder={t("phone")} value={e.phone} onChange={(x) => setE({ ...e, phone: digitsOnly(x.target.value) })} />
          <select className="inp" aria-label={t("occasion")} value={e.occasion} onChange={(x) => setE({ ...e, occasion: x.target.value })}>
            <option value="Wedding">{t("wedding")}</option><option value="Griha Pravesh">{t("grihaP")}</option><option value="Temple / Bulk">{t("temple")}</option><option value="Other">{t("other")}</option>
          </select>
          <input className="inp" placeholder={t("qty")} value={e.qty} onChange={(x) => setE({ ...e, qty: x.target.value })} />
          <textarea className="inp" rows={4} placeholder={t("details")} value={e.details} onChange={(x) => setE({ ...e, details: x.target.value })} />
          {err && <p role="alert" className="flex items-center gap-1 font-medium text-ruby"><Icon name="warn" className="h-5 w-5" /> {err}</p>}
          <button type="button" className="btn" onClick={sendEnquiry}>{t("sendEnq")}</button>
        </div>
      )}
    </section>
  );
}
