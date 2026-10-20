"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartData, CartItem } from "@/types";
import { CART_EVENT, CART_KEY, cartItemCount, cartTotal, loadCartData, saveCartData } from "./cart";

interface CartApi {
  cart: CartData;
  ready: boolean;
  count: number;
  total: number;
  /** Set the quantity of an item; quantity <= 0 removes it. */
  setItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  removeKey: (key: string) => void;
  clear: () => void;
}
const Ctx = createContext<CartApi>({ cart: {}, ready: false, count: 0, total: 0, setItem: () => {}, removeKey: () => {}, clear: () => {} });

/** Shared localStorage-backed cart. One entry per kit + tier + add-ons. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartData>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setCart(loadCartData());
    sync();
    setReady(true);
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setItem = useCallback((item: Omit<CartItem, "quantity">, quantity: number) => {
    const data = loadCartData();
    if (quantity > 0) data[item.key] = { ...item, quantity };
    else delete data[item.key];
    saveCartData(data);
    setCart(data);
  }, []);

  const removeKey = useCallback((key: string) => {
    const data = loadCartData();
    delete data[key];
    saveCartData(data);
    setCart(data);
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(CART_KEY);
    } catch {}
    window.dispatchEvent(new Event(CART_EVENT));
    setCart({});
  }, []);

  const value = useMemo(() => ({ cart, ready, count: cartItemCount(cart), total: cartTotal(cart), setItem, removeKey, clear }), [cart, ready, setItem, removeKey, clear]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useCart = () => useContext(Ctx);
