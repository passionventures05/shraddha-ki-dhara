"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLang, type K } from "@/lib/lang";
import { useCart } from "@/lib/useCart";
import { site } from "@/lib/site";
import { ringBell, setSound, soundOn } from "@/lib/sound";
import { ArchOrnament, Icon, Lotus, Mandala, Phone, SacredDivider, TempleSkyline } from "./ornaments";

export const Foil = () => <div className="foil" />;

/** Fades content up gently as it scrolls into view. */
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { el.classList.add("in"); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

const PETALS: [number, number, string][] = [[6, 11, "#F08A1C"], [17, 9, "#A32A35"], [29, 13, "#C8962E"], [41, 10, "#F08A1C"], [54, 12, "#A32A35"], [66, 9, "#C8962E"], [78, 13, "#F08A1C"], [90, 10, "#A32A35"]];
export function Petals() {
  return (
    <div className="petals" aria-hidden>
      {PETALS.map(([l, s, c], i) => (
        <span key={i} className="petal" style={{ left: `${l}%`, "--s": `${s}px`, "--c": c, "--d": `${22 + i * 3}s`, "--dl": `-${i * 4}s` } as CSSProperties} />
      ))}
    </div>
  );
}

export function Heading({ title, sub, eyebrow, light }: { title: string; sub?: string; eyebrow?: string; light?: boolean }) {
  return (
    <div className="mb-12 text-center">
      <ArchOrnament className={`mb-3 ${light ? "text-gold2" : "text-gold"}`} />
      {eyebrow && <p className={`mb-2 text-xs font-medium uppercase tracking-[.3em] ${light ? "text-gold2" : "text-gold3"}`}>{eyebrow}</p>}
      <h2 className="foil-title text-4xl md:text-6xl">{title}</h2>
      <SacredDivider kind="tilak" className={`my-4 ${light ? "!text-gold2" : ""}`} />
      {sub && <p className="mx-auto max-w-xl text-lg italic opacity-90">{sub}</p>}
    </div>
  );
}

/** Temple bell on/off. Off until the visitor chooses; ringing it once confirms it works. */
export function SoundToggle() {
  const { t } = useLang();
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(soundOn());
    sync();
    window.addEventListener("sd-sound", sync);
    return () => window.removeEventListener("sd-sound", sync);
  }, []);
  return (
    <button type="button" aria-pressed={on} aria-label={on ? t("soundOff") : t("soundOn")} title={on ? t("soundOff") : t("soundOn")}
      className="grid h-8 w-8 place-items-center rounded-full border border-gold2 text-gold2 transition hover:bg-gold2 hover:text-maroon2"
      onClick={() => { const next = !on; setSound(next); if (next) ringBell(true); }}>
      <Icon name={on ? "bell" : "bellOff"} className="h-4 w-4" />
    </button>
  );
}

const links: { href: string; k: K }[] = [
  { href: "/", k: "home" }, { href: "/products", k: "products" }, { href: "/special-order", k: "special" }, { href: "/blogs", k: "blogs" },
];

export function AnnounceBar() {
  const { t } = useLang();
  return (
    <div className="metal text-center text-xs tracking-wide md:text-sm">
      <div className="px-4 py-2">✦ {t("announce").replace("{h}", String(site.leadHours))} ✦</div>
      <Foil />
    </div>
  );
}

export function Navbar() {
  const { t, lang, setLang } = useLang();
  const { count } = useCart();
  const path = usePathname();
  const on = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  return (
    <header className="sticky top-0 z-50" style={{ boxShadow: "0 8px 22px rgba(92,15,25,.25)" }}>
      <div className="metal border-b-2 border-gold">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2">
            <Lotus className="h-6 w-9 text-gold2" />
            <span className="gold-text whitespace-nowrap font-display text-xl font-bold sm:text-2xl md:text-3xl">{site.name}</span>
          </Link>
          <nav className="hidden gap-8 font-medium md:flex">
            {links.map((l) => <Link key={l.href} href={l.href} className={`nav-link ${on(l.href) ? "on" : ""}`}>{t(l.k)}</Link>)}
          </nav>
          <div className="flex items-center gap-2">
            <SoundToggle />
            <button className="rounded-full border border-gold2 px-3 py-1 text-sm text-gold2 transition hover:bg-gold2 hover:text-maroon2" onClick={() => setLang(lang === "en" ? "hi" : "en")} aria-label="Toggle language">{lang === "en" ? "हिं" : "EN"}</button>
            <Link href="/cart" className="btn btn-gold btn-sm">{t("cart")}<span className="grid h-5 min-w-5 place-items-center rounded-full bg-maroon px-1 text-xs text-gold2">{count}</span></Link>
          </div>
        </div>
        <nav className="flex justify-around border-t border-gold/40 px-2 py-1.5 text-sm md:hidden">
          {links.map((l) => <Link key={l.href} href={l.href} className={`nav-link whitespace-nowrap ${on(l.href) ? "on" : ""}`}>{t(l.k)}</Link>)}
        </nav>
      </div>
      <div className="toran" aria-hidden />
    </header>
  );
}

export function Footer() {
  const { t } = useLang();
  const h = String(site.leadHours);
  return (
    <>
    <div className="mt-24 text-[#6B1420]" aria-hidden><TempleSkyline className="block h-20 w-full md:h-32" /></div>
    <footer className="metal">
      <div aria-hidden style={{ position: "absolute", left: "-6rem", top: "-4rem", pointerEvents: "none" }}><Mandala className="h-80 w-80 text-gold2 opacity-15" /></div>
      <div aria-hidden style={{ position: "absolute", right: "-6rem", bottom: "-6rem", pointerEvents: "none" }}><Mandala className="h-96 w-96 text-gold2 opacity-15" /></div>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <Lotus className="mx-auto h-10 w-16 text-gold2" />
          <p className="gold-text mt-2 font-display text-5xl font-bold md:text-6xl">{site.name}</p>
          <p className="mt-2 font-display text-2xl italic text-gold2">{t("sub")}</p>
          <p className="mt-4 font-display text-xl text-gold2/90">ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॐ</p>
        </div>
        <div className="mt-12 grid gap-10 text-center md:grid-cols-3 md:text-left">
          <div>
            <h3 className="mb-3 text-2xl">{t("explore")}</h3>
            <ul className="space-y-1">
              {[...links, { href: "/cart", k: "cart" as K }].map((l) => <li key={l.href}><Link href={l.href} className="hover:text-gold2">{t(l.k)}</Link></li>)}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-2xl">{t("contact")}</h3>
            <ul className="space-y-1">
              <li><a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-gold2">WhatsApp</a></li>
              <li><a href={`tel:+${site.whatsapp}`} className="hover:text-gold2">{site.phoneDisplay}</a></li>
              <li><a href={site.youtube} target="_blank" rel="noreferrer" className="hover:text-gold2">YouTube</a></li>
              <li><a href={`mailto:${site.email}`} className="hover:text-gold2">{site.email}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-2xl">{t("notice")}</h3>
            <p className="text-sm opacity-90">{t("noticeText").replace("{h}", h)}</p>
          </div>
        </div>
        <div className="mt-12 flex items-center justify-center gap-3 text-gold2" aria-hidden><span className="rule" /><Lotus className="h-4 w-7" /><span className="rule r" /></div>
        <p className="mt-5 text-center text-sm opacity-90">{t("foot")} · © {new Date().getFullYear()}</p>
      </div>
    </footer>
    </>
  );
}

export function WhatsAppFab() {
  return <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="fab"><Phone className="h-6 w-6" /></a>;
}
