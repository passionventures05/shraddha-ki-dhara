export type Tier = 0 | 1 | 2;

/** A puja kit as published by the CMS (see scripts/content-lib.mjs). */
export interface Product {
  id: string;
  name: string;
  nameHi: string;
  category: string;
  /** Basic, Standard, Premium (whole rupees) */
  prices: [number, number, number];
  contents: string[];
  contentsHi: string[];
  description: string;
  descriptionHi: string;
  /** photo path chosen in the CMS, e.g. "/uploads/products/x.jpg" */
  image?: string;
}

export interface Addon { id: string; en: string; hi: string; price: number }

export interface CartItem {
  /** unique per kit + tier + add-ons */
  key: string;
  name: string;
  nameHi: string;
  /** "Standard + Brass diya set" */
  label: string;
  unitPrice: number;
  quantity: number;
  /** kit category, used to work out the notice time for the order */
  category?: string;
  image?: string;
}

export type CartData = Record<string, CartItem>;
