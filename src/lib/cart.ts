import type { CartData, CartItem } from "@/types";

export const CART_KEY = "sdCart_v2";
export const CART_EVENT = "sd-cart-updated";

export const loadCartData = (): CartData => {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "null");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const saveCartData = (data: CartData) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save cart:", e);
  }
  window.dispatchEvent(new Event(CART_EVENT));
};

export const cartItems = (data: CartData): CartItem[] => Object.values(data).filter((i) => i.quantity > 0);
export const cartItemCount = (data: CartData) => cartItems(data).reduce((s, i) => s + i.quantity, 0);
export const cartTotal = (data: CartData) => cartItems(data).reduce((s, i) => s + i.unitPrice * i.quantity, 0);
