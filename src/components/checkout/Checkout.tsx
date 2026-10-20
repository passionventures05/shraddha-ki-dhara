"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "@/lib/lang";
import { useCart } from "@/lib/useCart";
import { cartTotal } from "@/lib/cart";
import { isMobileDevice, openExternalUrl, openWhatsApp } from "@/lib/external";
import { inr } from "@/lib/products";
import { leadTimeText } from "@/lib/products";
import { site } from "@/lib/site";
import { digitsOnly, earliestDelivery, toDateInput, toTimeInput } from "@/lib/validation";
import {
  ORDER_FIELD_ORDER, advanceAmount, buildDelivery, cartLeadTimeHours, emptyOrderForm, generateWhatsAppMessage,
  getCartDetails, getFieldErrors, validateOrder, type OrderForm,
} from "@/lib/order";
import { Diya, Icon } from "../ornaments";
import { Heading } from "../ui";

type Stage = "form" | "pay" | "sent" | "done";

/** Cart, then details, then advance payment, then send on WhatsApp. The cart is only cleared after the customer confirms. */
export default function Checkout() {
  const { t, tf, lang } = useLang();
  const { cart, ready, setItem, removeKey, clear } = useCart();
  const [form, setForm] = useState<OrderForm>({ ...emptyOrderForm, orderingForSomeone: "no" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [showQr, setShowQr] = useState(false);
  const [qr, setQr] = useState("");
  const [mobile, setMobile] = useState(false);
  const [minDT, setMinDT] = useState<Date | null>(null);
  const [toast, setToast] = useState("");
  const lastMessage = useRef("");
  const topRef = useRef<HTMLDivElement>(null);

  const entries = Object.entries(cart).filter(([, i]) => i.quantity > 0);
  const hasItems = entries.length > 0;
  const total = cartTotal(cart);
  const advance = advanceAmount(total);
  const leadHours = cartLeadTimeHours(cart);
  const lead = leadTimeText(leadHours, lang);
  const say = (key: string, vars?: Record<string, string>) => tf(key as "eName", vars);

  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(""), 3200); };
  const clearError = (id: string) => setErrors((e) => { if (!e[id]) return e; const { [id]: _gone, ...rest } = e; void _gone; return rest; });
  const set = <K extends keyof OrderForm>(key: K, value: OrderForm[K], errorId?: string) => { setForm((f) => ({ ...f, [key]: value })); if (errorId) clearError(errorId); };
  const aria = (id: string) => ({ "aria-invalid": errors[id] ? (true as const) : undefined, "aria-describedby": errors[id] ? `err-${id}` : undefined });
  const fieldError = (id: string) => errors[id] ? <p className="mt-1 flex items-start gap-1 text-sm text-ruby" id={`err-${id}`} role="alert"><Icon name="warn" className="mt-0.5 h-4 w-4 shrink-0" /> {errors[id]}</p> : null;

  useEffect(() => { setMobile(isMobileDevice()); setShowQr(!isMobileDevice()); }, []);
  useEffect(() => {
    const tick = () => setMinDT(earliestDelivery(new Date(), leadHours));
    tick();
    const id = window.setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [leadHours]);

  const minDateStr = minDT ? toDateInput(minDT) : undefined;
  const minTimeStr = minDT ? toTimeInput(minDT) : undefined;

  useEffect(() => { if (minDateStr && form.deliveryDate && form.deliveryDate < minDateStr) setForm((f) => ({ ...f, deliveryDate: "", deliveryTime: "" })); }, [minDateStr, form.deliveryDate]);

  const onDateChange = (value: string) => {
    clearError("delivery-date");
    if (!value || !minDT || !minDateStr || !minTimeStr) return set("deliveryDate", value);
    if (value === minDateStr) setForm((f) => ({ ...f, deliveryDate: value, deliveryTime: f.deliveryTime && f.deliveryTime < minTimeStr ? "" : f.deliveryTime }));
    else if (new Date(`${value}T00:00:00`) > new Date(`${minDateStr}T00:00:00`)) set("deliveryDate", value);
    else { setForm((f) => ({ ...f, deliveryDate: "", deliveryTime: "" })); setErrors((e) => ({ ...e, "delivery-date": tf("eDateMin", { lead }) })); }
  };
  const onTimeChange = (value: string) => {
    clearError("delivery-time");
    if (form.deliveryDate && value && new Date(`${form.deliveryDate}T${value}`) < earliestDelivery(new Date(), leadHours)) {
      setErrors((e) => ({ ...e, "delivery-time": tf("eTimeMin", { lead }) }));
      return set("deliveryTime", "");
    }
    set("deliveryTime", value);
  };
  const onForSomeone = (value: OrderForm["orderingForSomeone"]) => {
    setForm((f) => value === "yes" ? { ...f, orderingForSomeone: value } : { ...f, orderingForSomeone: value, deliveryPhone: "", deliveryName: "", deliveryAddress: "" });
    ["delivery-phone", "delivery-name", "delivery-address"].forEach(clearError);
  };

  const changeQty = (key: string, delta: number) => {
    const item = cart[key];
    if (!item) return;
    const { quantity, ...rest } = item;
    setItem(rest, quantity + delta);
  };
  const toTop = () => window.setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);

  /** Details to advance payment: check the form first. */
  const continueToPayment = () => {
    const found = getFieldErrors(form, new Date(), leadHours, say);
    if (Object.keys(found).length) {
      setErrors(found);
      setSummary(t("checkFields"));
      const first = ORDER_FIELD_ORDER.find((id) => found[id]);
      const el = first ? document.getElementById(first) : null;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => el?.focus({ preventScroll: true }), 350);
      return;
    }
    setErrors({}); setSummary(""); setStage("pay"); toTop();
  };

  /** Advance payment to WhatsApp. The cart stays until the customer confirms they sent the message. */
  const sendOrder = () => {
    const delivery = buildDelivery(form);
    const problem = validateOrder(form, delivery, new Date(), leadHours);
    if (problem) { setErrors(getFieldErrors(form, new Date(), leadHours, say)); setSummary(problem); setStage("form"); toTop(); return; }
    lastMessage.current = generateWhatsAppMessage(form, delivery, getCartDetails(cart));
    setStage("sent"); toTop();
    try { openWhatsApp(lastMessage.current); } catch { flash(tf("waFail", { phone: site.phoneDisplay })); }
  };
  const reopen = () => { try { openWhatsApp(lastMessage.current); } catch { flash(tf("waFail", { phone: site.phoneDisplay })); } };
  const confirmSent = () => { clear(); setStage("done"); toTop(); };

  const upiLink = useMemo(
    () => `upi://pay?pa=${encodeURIComponent(site.upi)}&pn=${encodeURIComponent(site.name)}&am=${advance}&cu=INR&tn=${encodeURIComponent("Advance for puja kit order")}`,
    [advance],
  );
  // QR code of the payment link, with the amount filled in
  useEffect(() => {
    if (stage !== "pay" || !showQr) return;
    let alive = true;
    import("qrcode").then((Q) => Q.toDataURL(upiLink, { width: 260, margin: 1, color: { dark: "#4A1219", light: "#FFF9EC" } })).then((u) => alive && setQr(u)).catch(() => {});
    return () => { alive = false; };
  }, [stage, showQr, upiLink]);

  const copyUpi = async () => { try { await navigator.clipboard.writeText(site.upi); flash(t("upiCopied")); } catch { flash(tf("upiIs", { id: site.upi })); } };

  const stepIndex = stage === "form" ? 1 : stage === "pay" ? 2 : 3;
  const showEmpty = ready && !hasItems && stage !== "done" && stage !== "sent";
  const STEPS = [t("st1"), t("st2"), t("st3"), t("st4")];

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div ref={topRef} className="scroll-mt-32" />
      <Heading eyebrow={t("coEyebrow")} title={t("cart")} />
      {toast && <p role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-gold2 bg-maroon px-5 py-2 text-sm text-cream">{toast}</p>}

      {!showEmpty && (
        <ol className="stepper" aria-label={t("progress")}>
          {STEPS.map((label, i) => {
            const done = i < stepIndex || stage === "done";
            return (
              <li key={label} className={done ? "done" : i === stepIndex ? "current" : ""} aria-current={i === stepIndex && stage !== "done" ? "step" : undefined}>
                <span className="dot">{done ? <Icon name="check" className="h-4 w-4" /> : i + 1}</span><span className="lbl">{label}</span>
              </li>
            );
          })}
        </ol>
      )}

      {showEmpty && (
        <div className="card p-10 text-center">
          <Diya className="mx-auto mb-3 h-16 w-16 text-gold" />
          <h2 className="text-3xl">{t("emptyTitle")}</h2>
          <p className="mt-2">{t("empty")}</p>
          <Link href="/products/" className="btn mt-6">{t("startShopping")}</Link>
        </div>
      )}

      {hasItems && (stage === "form" || stage === "pay") && (
        <div className="card mb-8 p-5 md:p-6">
          <h2 className="mb-2 text-3xl">{t("selection")}</h2>
          <ul className="divide-y divide-gold/40">
            {entries.map(([key, item]) => (
              <li key={key} className="flex flex-wrap items-center gap-3 py-4">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" width={64} height={64} className="h-16 w-16 rounded-lg object-cover" />
                ) : (
                  <div className="metal grid h-16 w-16 place-items-center rounded-lg text-gold2"><Diya className="h-8 w-8" /></div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl font-bold text-maroon">{lang === "hi" ? item.nameHi : item.name}</p>
                  <p className="text-sm">{item.label} · {inr(item.unitPrice)} {t("each")}</p>
                  {stage === "form" ? (
                    <div className="qty mt-1" role="group" aria-label={tf("qtyOf", { name: item.name })}>
                      <button type="button" aria-label="−" onClick={() => changeQty(key, -1)}><Icon name="minus" className="h-4 w-4" /></button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button type="button" aria-label="+" onClick={() => changeQty(key, 1)}><Icon name="plus" className="h-4 w-4" /></button>
                    </div>
                  ) : <p className="text-sm">{t("qty")}: {item.quantity}</p>}
                </div>
                <div className="text-right">
                  <p className="font-medium">{inr(item.unitPrice * item.quantity)}</p>
                  {stage === "form" && <button type="button" className="mt-1 inline-flex items-center gap-1 text-sm text-ruby underline" onClick={() => removeKey(key)}><Icon name="trash" className="h-4 w-4" /> {t("remove")}</button>}
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-3 grid gap-1 border-t border-gold/50 pt-3">
            <div className="flex justify-between font-display text-3xl font-bold text-maroon"><dt>{t("totalAmt")}</dt><dd>{inr(total)}</dd></div>
            <div className="flex justify-between text-emerald"><dt>{tf("advTo", { p: site.advancePercent })}</dt><dd>{inr(advance)}</dd></div>
            <div className="flex justify-between text-sm"><dt>{t("balance")}</dt><dd>{inr(total - advance)}</dd></div>
          </dl>
          {stage === "form" && <p className="mt-3 text-sm"><Link href="/products/" className="underline">← {t("continueShop")}</Link></p>}
        </div>
      )}

      {hasItems && stage === "form" && (
        <div className="card p-5 md:p-7">
          <h2 className="text-3xl">{t("detailsTitle")}</h2>
          <p className="mt-1 text-sm">{tf("detailsSub", { lead })}</p>
          {summary && <p className="mt-3 flex items-center gap-2 rounded-lg bg-ruby/10 p-3 text-ruby" role="alert"><Icon name="warn" className="h-5 w-5" /> {summary}</p>}
          <form className="mt-4 grid gap-6" onSubmit={(e) => { e.preventDefault(); continueToPayment(); }} noValidate>
            <fieldset className="grid gap-4"><legend className="mb-1 font-display text-2xl text-maroon">{t("aboutYou")}</legend>
              <div><label htmlFor="name" className="text-sm">{t("name")}</label><input id="name" className="inp" autoComplete="name" {...aria("name")} value={form.name} onChange={(e) => set("name", e.target.value, "name")} />{fieldError("name")}</div>
              <div><label htmlFor="phone" className="text-sm">{t("phone")}</label><input id="phone" className="inp" type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" {...aria("phone")} value={form.phone} onChange={(e) => set("phone", digitsOnly(e.target.value), "phone")} />{fieldError("phone")}</div>
              <div><label htmlFor="address" className="text-sm">{t("address")}</label><input id="address" className="inp" autoComplete="street-address" {...aria("address")} value={form.address} onChange={(e) => set("address", e.target.value, "address")} />{fieldError("address")}</div>
            </fieldset>

            <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="mb-1 font-display text-2xl text-maroon">{t("deliveryLegend")}</legend>
              <div className="sm:col-span-2"><label htmlFor="ordering-for-someone" className="text-sm">{t("forSomeone")}</label>
                <select id="ordering-for-someone" className="inp" value={form.orderingForSomeone} onChange={(e) => onForSomeone(e.target.value as OrderForm["orderingForSomeone"])}>
                  <option value="no">{t("optNo")}</option><option value="yes">{t("optYes")}</option></select></div>
              {form.orderingForSomeone === "yes" && (
                <div className="grid gap-4 rounded-xl border border-gold/50 bg-cream2 p-4 sm:col-span-2 sm:grid-cols-2">
                  <div><label htmlFor="delivery-name" className="text-sm">{t("rName")}</label><input id="delivery-name" className="inp" {...aria("delivery-name")} value={form.deliveryName} onChange={(e) => set("deliveryName", e.target.value, "delivery-name")} />{fieldError("delivery-name")}</div>
                  <div><label htmlFor="delivery-phone" className="text-sm">{t("rPhone")}</label><input id="delivery-phone" className="inp" type="tel" inputMode="numeric" maxLength={10} {...aria("delivery-phone")} value={form.deliveryPhone} onChange={(e) => set("deliveryPhone", digitsOnly(e.target.value), "delivery-phone")} />{fieldError("delivery-phone")}</div>
                  <div className="sm:col-span-2"><label htmlFor="delivery-address" className="text-sm">{t("rAddr")}</label><input id="delivery-address" className="inp" {...aria("delivery-address")} value={form.deliveryAddress} onChange={(e) => set("deliveryAddress", e.target.value, "delivery-address")} />{fieldError("delivery-address")}</div>
                </div>
              )}
              <div><label htmlFor="delivery-date" className="text-sm">{tf("dateLbl", { lead })}</label><input id="delivery-date" type="date" className="inp" min={minDateStr} {...aria("delivery-date")} value={form.deliveryDate} onChange={(e) => onDateChange(e.target.value)} />{fieldError("delivery-date")}</div>
              <div><label htmlFor="delivery-time" className="text-sm">{t("timeLbl")}</label><input id="delivery-time" type="time" className="inp" min={form.deliveryDate && form.deliveryDate === minDateStr ? minTimeStr : undefined} {...aria("delivery-time")} value={form.deliveryTime} onChange={(e) => onTimeChange(e.target.value)} />{fieldError("delivery-time")}</div>
              <div className="sm:col-span-2"><label htmlFor="delivery-mode" className="text-sm">{t("modeLbl")}</label>
                <select id="delivery-mode" className="inp" value={form.deliveryMode} {...aria("delivery-mode")} onChange={(e) => set("deliveryMode", e.target.value as OrderForm["deliveryMode"], "delivery-mode")}>
                  <option value="" disabled>{t("selectOpt")}</option><option value="home-delivery">{t("delivery")}</option><option value="pick-up">{t("pickup")}</option></select>{fieldError("delivery-mode")}</div>
            </fieldset>

            <fieldset className="grid gap-4"><legend className="mb-1 font-display text-2xl text-maroon">{t("yourPuja")}</legend>
              <div><label htmlFor="sankalp" className="text-sm">{t("sankalp")} <span className="opacity-70">{t("optional")}</span></label><input id="sankalp" className="inp" placeholder={t("sankalpPh")} value={form.sankalpName} onChange={(e) => set("sankalpName", e.target.value)} /></div>
              <div><label htmlFor="occasion" className="text-sm">{t("occasion")}</label><input id="occasion" className="inp" placeholder={t("occPh")} {...aria("occasion")} value={form.occasion} onChange={(e) => set("occasion", e.target.value, "occasion")} />{fieldError("occasion")}</div>
              <div><label htmlFor="special-request" className="text-sm">{t("anything")} <span className="opacity-70">{t("optional")}</span></label><textarea id="special-request" className="inp" rows={3} placeholder={t("specialPh")} value={form.specialRequest} onChange={(e) => set("specialRequest", e.target.value)} /></div>
            </fieldset>
            <button type="submit" className="btn">{t("continuePay")} <Icon name="arrow" /></button>
          </form>
        </div>
      )}

      {hasItems && stage === "pay" && (
        <div className="card p-5 text-center md:p-7">
          <h2 className="text-3xl">{t("payTitle")}</h2>
          <p className="mt-1 text-sm">{tf("paySub", { p: site.advancePercent })}</p>
          <div className="metal mx-auto my-5 max-w-sm rounded-2xl border border-gold px-6 py-5">
            <p className="text-sm uppercase tracking-widest">{t("payNow")}</p>
            <p className="gold-text font-display text-6xl font-bold">{inr(advance)}</p>
            <p className="text-xs opacity-90">{tf("payOf", { total: inr(total), bal: inr(total - advance) })}</p>
          </div>
          <div className="mx-auto grid max-w-sm gap-3">
            {mobile && <button type="button" className="btn" onClick={() => openExternalUrl(upiLink)}><Icon name="phone" /> {tf("payUpiApp", { amt: inr(advance) })}</button>}
            <div className="flex items-center justify-between gap-2 rounded-xl border border-gold/60 bg-cream2 px-3 py-2">
              <span className="text-sm">{t("upiIdLbl")}</span><code className="break-all font-medium text-maroon">{site.upi}</code>
              <button type="button" className="btn btn-gold btn-sm" onClick={copyUpi}><Icon name="copy" className="h-4 w-4" /> {t("copy")}</button>
            </div>
            <button type="button" className="btn btn-gold" aria-expanded={showQr} onClick={() => setShowQr((v) => !v)}><Icon name="qr" /> {showQr ? t("hideQr") : t("showQr")}</button>
            {showQr && qr && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt={t("qrAlt")} width={260} height={260} className="mx-auto rounded-xl border-2 border-gold p-2" />
            )}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button type="button" className="btn btn-gold" onClick={() => { setStage("form"); toTop(); }}><Icon name="left" /> {t("editDetails")}</button>
            <button type="button" className="btn" onClick={sendOrder}><Icon name="phone" /> {t("send")}</button>
          </div>
          <p className="mt-4 text-sm">{t("paidAlready")}</p>
        </div>
      )}

      {stage === "sent" && (
        <div className="card p-8 text-center" aria-live="polite">
          <div className="metal mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full text-gold2"><Icon name="phone" className="h-8 w-8" /></div>
          <h2 className="text-3xl">{t("sentTitle")}</h2>
          <p className="mx-auto mt-2 max-w-lg">{t("sentSub")}</p>
          <div className="mx-auto mt-5 grid max-w-sm gap-3">
            <button type="button" className="btn" onClick={reopen}><Icon name="phone" /> {t("openAgain")}</button>
            <button type="button" className="btn btn-gold" onClick={confirmSent}><Icon name="check" /> {t("sentClear")}</button>
            <button type="button" className="text-sm underline" onClick={() => { setStage("form"); toTop(); }}>{t("changeDetails")}</button>
          </div>
        </div>
      )}

      {stage === "done" && (
        <div className="card p-8 text-center">
          <Diya className="glow mx-auto mb-3 h-20 w-20 text-gold" />
          <h2 className="text-4xl">{t("thanks")}</h2>
          <p className="mx-auto mt-2 max-w-lg">{t("thanksSub")}</p>
          <div className="mx-auto mt-5 grid max-w-sm gap-3">
            <Link href="/products/" className="btn">{t("orderAnother")}</Link>
            <Link href="/" className="btn btn-gold">{t("backHome")}</Link>
          </div>
        </div>
      )}
    </section>
  );
}
