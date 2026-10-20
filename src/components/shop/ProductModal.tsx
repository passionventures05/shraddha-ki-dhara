"use client";
import { useId, useState } from "react";
import type { CartData, CartItem, Product } from "@/types";
import { useLang } from "@/lib/lang";
import { addons, categoryHi, inr, kitPrice, TIERS } from "@/lib/products";
import { Icon, Jharokha } from "../ornaments";
import KitImage from "./KitImage";
import { itemKey, toCartItem } from "./ProductCard";
import { useDialog } from "./useDialog";

interface Props { product: Product; cart: CartData; onClose: () => void; onCommit: (item: Omit<CartItem, "quantity">, qty: number) => void }

export default function ProductModal({ product, cart, onClose, onCommit }: Props) {
  const { t, lang } = useLang();
  const titleId = useId();
  const { show, close, panelRef, closeRef } = useDialog(onClose, 300);
  const [tier, setTier] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const key = itemKey(product.id, tier, picked);
  const inCart = cart[key]?.quantity ?? 0;
  const [quantity, setQuantity] = useState(inCart);
  const price = kitPrice(product, tier, picked);
  const name = lang === "hi" ? product.nameHi : product.name;
  const contents = lang === "hi" ? product.contentsHi : product.contents;

  const pickTier = (i: number) => { setTier(i); setQuantity(cart[itemKey(product.id, i, picked)]?.quantity ?? 0); };
  const toggleAddon = (id: string) => {
    const next = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id];
    setPicked(next);
    setQuantity(cart[itemKey(product.id, tier, next)]?.quantity ?? 0);
  };
  const commit = () => { const q = quantity === 0 ? 1 : quantity; onCommit(toCartItem(product, tier, picked, price), q); close(); };

  return (
    <div className={show ? "overlay show" : "overlay"} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={(el) => { panelRef.current = el; }}>
        <button type="button" className="dialog-x" aria-label={t("closeX")} onClick={close} ref={closeRef}><Icon name="x" /></button>
        <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
          <Jharokha className="mx-auto h-72 w-56 md:w-full"><KitImage product={{ ...product, name }} /></Jharokha>
          <div>
            <p className="text-xs font-medium uppercase tracking-[.25em] text-gold3">{lang === "hi" ? categoryHi(product.category) : product.category}</p>
            <h2 id={titleId} className="text-3xl md:text-4xl">{name}</h2>
            <p className="mt-1 font-display text-4xl text-maroon" aria-live="polite">{inr(price)}</p>
            <p className="mt-2 text-sm">{lang === "hi" ? product.descriptionHi : product.description}</p>
            {contents.length > 0 && (
              <>
                <p className="mt-4 text-sm font-medium text-maroon">{t("inside")}</p>
                <ul className="mt-1 columns-2 text-sm">{contents.map((c) => <li key={c} className="before:mr-2 before:text-gold before:content-['✦']">{c}</li>)}</ul>
              </>
            )}
            <p className="mt-4 text-sm font-medium text-maroon">{t("tier")}</p>
            <div className="mt-1 flex gap-2" role="group" aria-label={t("tier")}>
              {TIERS.map((n, i) => (
                <button key={n} type="button" aria-pressed={tier === i} onClick={() => pickTier(i)}
                  className={`flex-1 rounded-full border border-gold px-2 py-1 text-sm ${tier === i ? "metal !text-cream" : "bg-cream2"}`}>{t(`tier${i}` as "tier0")} · {inr(product.prices[i])}</button>
              ))}
            </div>
            {addons.length > 0 && (
              <>
                <p className="mt-4 text-sm font-medium text-maroon">{t("addons")}</p>
                {addons.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="accent-emerald" checked={picked.includes(a.id)} onChange={() => toggleAddon(a.id)} />
                    {lang === "hi" ? a.hi : a.en} (+{inr(a.price)})
                  </label>
                ))}
              </>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="qty" role="group" aria-label={t("qty")}>
                <button type="button" aria-label="−" disabled={quantity === 0} onClick={() => setQuantity(Math.max(0, quantity - 1))}><Icon name="minus" className="h-4 w-4" /></button>
                <span aria-live="polite">{quantity}</span>
                <button type="button" aria-label="+" onClick={() => setQuantity(quantity + 1)}><Icon name="plus" className="h-4 w-4" /></button>
              </div>
              <button type="button" className="btn flex-1" onClick={commit}><Icon name="cart" className="h-5 w-5" /> {inCart === 0 ? t("add") : t("updateCart")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
