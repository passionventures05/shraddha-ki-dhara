"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CartItem, Product } from "@/types";
import { useLang } from "@/lib/lang";
import { useCart } from "@/lib/useCart";
import { openWhatsApp } from "@/lib/external";
import { ringBell } from "@/lib/sound";
import { CATEGORIES, categoryHi, kits, leadTimeHoursFor, leadTimeText, PRODUCTS_PER_PAGE } from "@/lib/products";
import { site } from "@/lib/site";
import { Heading } from "../ui";
import { Diya, Icon } from "../ornaments";
import MiniCart from "./MiniCart";
import PincodeCheck from "./PincodeCheck";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

export default function ProductsView() {
  const { t, tf, lang } = useLang();
  const { cart, setItem } = useCart();
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [cat, setCat] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<Product | null>(null);
  const [drawer, setDrawer] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollOnPage = useRef(false);

  // /products/?cat=Lakshmi opens straight on that category (static export: read it from the URL)
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("cat");
    if (c && CATEGORIES.some((x) => x.id === c)) setCat(c);
  }, []);
  useEffect(() => { const id = window.setTimeout(() => setTerm(q.trim().toLowerCase()), 250); return () => clearTimeout(id); }, [q]);
  useEffect(() => setPage(1), [cat, term]);

  const filtered = useMemo(() => kits
    .filter((k) => !cat || k.category === cat)
    .filter((k) => !term || [k.name, k.nameHi, k.category, categoryHi(k.category), k.description, k.descriptionHi].join(" ").toLowerCase().includes(term)), [cat, term]);
  const counts = useMemo(() => { const m: Record<string, number> = {}; kits.forEach((k) => { m[k.category] = (m[k.category] ?? 0) + 1; }); return m; }, []);
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const items = filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);
  const lead = leadTimeText(leadTimeHoursFor(cat ? [cat] : CATEGORIES.map((c) => c.id)), lang);

  const goTo = (n: number) => { scrollOnPage.current = true; setPage(n); };
  useEffect(() => { if (scrollOnPage.current) { scrollOnPage.current = false; gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); } }, [page]);

  const add = (item: Omit<CartItem, "quantity">, qty: number) => {
    const existed = (cart[item.key]?.quantity ?? 0) > 0 && qty <= (cart[item.key]?.quantity ?? 0);
    setItem(item, qty);
    ringBell();
    const name = lang === "hi" ? item.nameHi : item.name;
    setDrawer(tf(existed ? "updatedMsg" : "addedMsg", { name, label: item.label }));
  };

  const chip = (on: boolean) => `rounded-full border border-gold px-4 py-1 text-sm ${on ? "metal !text-cream" : "bg-cream2"}`;
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <Heading eyebrow={t("products")} title={t("products")} sub={t("sub")} />

      <div className="mb-8 grid gap-6 rounded-2xl border border-gold/50 bg-cream2 p-5 md:grid-cols-2 md:items-center">
        <ul className="grid gap-2 text-sm">
          <li className="flex items-center gap-2"><Icon name="clock" className="h-5 w-5 text-gold" /> {tf("infoNotice", { lead })}</li>
          <li className="flex items-center gap-2"><Icon name="gift" className="h-5 w-5 text-gold" /> {tf("infoAdvance", { p: site.advancePercent })}</li>
          <li className="flex items-center gap-2"><Icon name="phone" className="h-5 w-5 text-gold" /> {t("infoWa")}</li>
        </ul>
        <PincodeCheck />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Icon name="search" className="h-5 w-5 text-gold" />
        <input className="inp md:max-w-sm" aria-label={t("search")} placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Category">
        <button type="button" className={chip(cat === "")} aria-pressed={cat === ""} onClick={() => setCat("")}>{t("all")} ({kits.length})</button>
        {CATEGORIES.filter((c) => counts[c.id]).map((c) => (
          <button key={c.id} type="button" className={chip(cat === c.id)} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{lang === "hi" ? c.hi : c.id} ({counts[c.id]})</button>
        ))}
      </div>

      <div ref={gridRef} className="scroll-mt-32" />
      <p className="mb-4 text-sm" role="status" aria-live="polite">{tf("showing", { n: filtered.length })}</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((k, i) => (
          <div key={k.id} className="h-full"><ProductCard product={k} cart={cart} onOpen={setModal} onAdd={add} /></div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card mx-auto mt-6 max-w-xl p-8 text-center">
          <Diya className="mx-auto mb-2 h-14 w-14 text-gold" />
          <h2 className="text-3xl">{t("noMatchT")}</h2>
          <p className="mt-2">{t("noMatchB")}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" className="btn btn-gold btn-sm" onClick={() => { setQ(""); setCat(""); }}>{t("clearFilters")}</button>
            <Link href="/special-order/" className="btn btn-sm">{t("customKit")}</Link>
            <button type="button" className="btn btn-sm" onClick={() => openWhatsApp("Hi! I'm looking for a puja kit that isn't on the website 🪔")}>{t("askWa")}</button>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pages">
          <button type="button" className="btn btn-gold btn-sm" disabled={page === 1} onClick={() => goTo(page - 1)}><Icon name="left" className="h-4 w-4" /> {t("prev")}</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" className={`h-9 w-9 rounded-full border border-gold ${n === page ? "metal !text-cream" : "bg-cream2"}`} aria-current={n === page ? "page" : undefined} onClick={() => goTo(n)}>{n}</button>
          ))}
          <button type="button" className="btn btn-gold btn-sm" disabled={page === totalPages} onClick={() => goTo(page + 1)}>{t("next")} <Icon name="right" className="h-4 w-4" /></button>
        </nav>
      )}

      {drawer !== null && <MiniCart message={drawer} cart={cart} onSetItem={setItem} onClose={() => setDrawer(null)} />}
      {modal && <ProductModal key={modal.id} product={modal} cart={cart} onClose={() => setModal(null)} onCommit={(item, qty) => { add(item, qty); }} />}
    </section>
  );
}
