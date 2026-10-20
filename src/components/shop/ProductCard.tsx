"use client";
import { useState } from "react";
import type { CartData, CartItem, Product } from "@/types";
import { useLang } from "@/lib/lang";
import { categoryHi, inr, kitLabel, TIERS } from "@/lib/products";
import { Jharokha } from "../ornaments";
import KitImage from "./KitImage";

export const itemKey = (id: string, tier: number, addonIds: string[]) => `${id}|${tier}|${[...addonIds].sort().join(",")}`;

export const toCartItem = (p: Product, tier: number, addonIds: string[], price: number): Omit<CartItem, "quantity"> => ({
  key: itemKey(p.id, tier, addonIds), name: p.name, nameHi: p.nameHi, label: kitLabel(tier, addonIds),
  unitPrice: price, category: p.category, image: p.image,
});

interface Props { product: Product; cart: CartData; onOpen: (p: Product) => void; onAdd: (item: Omit<CartItem, "quantity">, qty: number) => void }

export default function ProductCard({ product, cart, onOpen, onAdd }: Props) {
  const { t, lang } = useLang();
  const [tier, setTier] = useState(0);
  const price = product.prices[tier];
  const key = itemKey(product.id, tier, []);
  const inCart = cart[key]?.quantity ?? 0;
  const name = lang === "hi" ? product.nameHi : product.name;
  return (
    <article className="card card-glow flex h-full flex-col p-5 text-center">
      <button type="button" onClick={() => onOpen(product)} aria-label={`${t("viewDetails")}: ${name}`} className="mx-auto mb-4 block">
        <Jharokha className="h-56 w-44"><KitImage product={{ ...product, name }} /></Jharokha>
      </button>
      <p className="text-xs font-medium uppercase tracking-[.25em] text-gold3">{lang === "hi" ? categoryHi(product.category) : product.category}</p>
      <h3 className="mt-1 text-2xl">{name}</h3>
      <div className="my-3 flex gap-2" role="group" aria-label={t("tier")}>
        {TIERS.map((n, i) => (
          <button key={n} type="button" aria-pressed={tier === i} onClick={() => setTier(i)}
            className={`flex-1 rounded-full border border-gold px-2 py-1 text-sm ${tier === i ? "metal !text-cream" : "bg-cream2"}`}>{t(`tier${i}` as "tier0")}</button>
        ))}
      </div>
      <p className="font-display text-3xl text-maroon">{inr(price)}</p>
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <button type="button" className="btn" onClick={() => onAdd(toCartItem(product, tier, [], price), inCart + 1)}>{inCart ? `${t("add")} (${inCart})` : t("add")}</button>
        <button type="button" className="text-sm text-emerald underline" onClick={() => onOpen(product)}>{t("viewDetails")}</button>
      </div>
    </article>
  );
}
