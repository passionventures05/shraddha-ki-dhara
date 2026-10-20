"use client";
import Link from "next/link";
import type { CartData, CartItem } from "@/types";
import { useLang } from "@/lib/lang";
import { cartItems, cartTotal } from "@/lib/cart";
import { inr } from "@/lib/products";
import { Diya, Icon } from "../ornaments";
import { useDialog } from "./useDialog";

interface Props { message: string; cart: CartData; onSetItem: (item: Omit<CartItem, "quantity">, qty: number) => void; onClose: () => void }

/** Slide-out cart that appears when something is added, so people see it landed and can check out in one tap. */
export default function MiniCart({ message, cart, onSetItem, onClose }: Props) {
  const { t, lang } = useLang();
  const { show, close, panelRef, closeRef } = useDialog(onClose, 380);
  const items = cartItems(cart);
  return (
    <div className={show ? "overlay drawer-overlay show" : "overlay drawer-overlay"} onClick={(e) => e.target === e.currentTarget && close()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={t("yourCart")} ref={(el) => { panelRef.current = el; }}>
        <div className="flex items-center justify-between border-b border-gold/50 pb-3">
          <h2 className="text-3xl">{t("yourCart")}</h2>
          <button type="button" className="dialog-x dx-static" aria-label={t("closeX")} onClick={close} ref={closeRef}><Icon name="x" /></button>
        </div>
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-emerald/10 p-3 text-sm text-emerald" role="status"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0" /> {message}</p>
        <ul className="mt-3 flex-1 divide-y divide-gold/30 overflow-y-auto">
          {items.map((it) => {
            const { quantity, ...rest } = it;
            return (
              <li key={it.key} className="flex gap-3 py-3">
                {it.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="metal grid h-14 w-14 shrink-0 place-items-center rounded-lg text-gold2"><Diya className="h-7 w-7" /></div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-bold leading-tight text-maroon">{lang === "hi" ? it.nameHi : it.name}</p>
                  <p className="text-xs">{it.label} · {inr(it.unitPrice)}</p>
                  <div className="qty mt-1" role="group" aria-label={t("qty")}>
                    <button type="button" aria-label="−" onClick={() => onSetItem(rest, quantity - 1)}><Icon name="minus" className="h-3.5 w-3.5" /></button>
                    <span aria-live="polite">{quantity}</span>
                    <button type="button" aria-label="+" onClick={() => onSetItem(rest, quantity + 1)}><Icon name="plus" className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <span className="font-medium">{inr(it.unitPrice * quantity)}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 grid gap-3 border-t border-gold/50 pt-4">
          <p className="flex justify-between font-display text-2xl text-maroon"><span>{t("subtotal")}</span><strong>{inr(cartTotal(cart))}</strong></p>
          <Link href="/cart/" className="btn"><Icon name="cart" /> {t("viewCart")}</Link>
          <button type="button" className="btn btn-gold" onClick={close}>{t("keepShopping")}</button>
        </div>
      </aside>
    </div>
  );
}
