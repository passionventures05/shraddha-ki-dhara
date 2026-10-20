import type { Product } from "@/types";
import categories from "./categories.json";
import { addons, kits, settings } from "./content";
export { inr } from "./format";
export { addons, kits };

export const TIERS = ["Basic", "Standard", "Premium"] as const;
export const PRODUCTS_PER_PAGE = 12;

export const CATEGORIES: { id: string; hi: string; leadTimeHours?: number }[] = categories.categories;
export const categoryHi = (id: string) => CATEGORIES.find((c) => c.id === id)?.hi ?? id;

/** Longest notice (hours) among the given categories; never below the site default. */
export const leadTimeHoursFor = (cats: Iterable<string | undefined>) => {
  const hours = [...cats].map((c) => CATEGORIES.find((x) => x.id === c)?.leadTimeHours ?? 0);
  return Math.max(settings.leadHours, ...hours);
};

/** "36 hours" / "3 days" for display. */
export const leadTimeText = (hours: number, lang: "en" | "hi" = "en") => {
  if (hours >= 48) {
    const d = Math.round(hours / 24);
    return lang === "hi" ? `${d} दिन` : `${d} days`;
  }
  return lang === "hi" ? `${hours} घंटे` : `${hours} hours`;
};

/** Price of a kit at a tier plus chosen add-ons. */
export const kitPrice = (p: Pick<Product, "prices">, tier: number, addonIds: string[] = []) =>
  p.prices[tier] + addons.filter((a) => addonIds.includes(a.id)).reduce((s, a) => s + a.price, 0);

/** Same wording the cart shows: "Standard + Brass diya set". */
export const kitLabel = (tier: number, addonIds: string[] = []) =>
  [TIERS[tier], ...addons.filter((a) => addonIds.includes(a.id)).map((a) => a.en)].join(" + ");

export const builderItems = [
  { id: "roli", en: "Roli & kumkum", hi: "रोली व कुमकुम", price: 40 }, { id: "akshat", en: "Akshat (rice)", hi: "अक्षत (चावल)", price: 30 },
  { id: "haldi", en: "Haldi", hi: "हल्दी", price: 30 }, { id: "camphor", en: "Camphor", hi: "कपूर", price: 50 },
  { id: "incense", en: "Incense sticks", hi: "अगरबत्ती", price: 60 }, { id: "ghee", en: "Ghee diya set", hi: "घी दीया सेट", price: 120 },
  { id: "panch", en: "Panchamrit set", hi: "पंचामृत सेट", price: 180 }, { id: "moli", en: "Moli & janeu", hi: "मौली व जनेऊ", price: 40 },
  { id: "paan", en: "Supari & paan", hi: "सुपारी व पान", price: 60 }, { id: "havan", en: "Havan samagri", hi: "हवन सामग्री", price: 150 },
];
