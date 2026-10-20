import raw from "@/generated/content.json";
import catalogue from "@/generated/catalogue.json";
import type { Addon, Product } from "@/types";

/** Everything the owner edits in the CMS, generated at build time into src/generated/. */
export interface Settings {
  whatsapp: string; phoneDisplay: string; upi: string; email: string; youtube: string;
  leadHours: number; advancePercent: number; deliveryPincodes: string[];
}
export interface Video { title: string; titleHi: string; url: string; thumb?: string }
export interface Review { name: string; nameHi: string; text: string; textHi: string }
export interface Mantra { sanskrit: string; en: string; hi: string }
export interface Festival { name: string; nameHi: string; date: string; category: string }
export interface GalleryPhoto { image: string; caption: string; captionHi: string }

const c = raw as unknown as {
  settings: Settings; addons: Addon[]; videos: Video[]; reviews: Review[]; mantras: Mantra[]; festivals: Festival[]; gallery: GalleryPhoto[];
};

export const settings = c.settings;
export const addons = c.addons;
export const videos = c.videos;
export const reviews = c.reviews;
export const festivals = c.festivals;
export const gallery = c.gallery;
export const kits = catalogue as unknown as Product[];

/** Used only if the owner empties the mantra list in the CMS. */
const FALLBACK: Mantra = {
  sanskrit: "ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ।",
  en: "May all be happy, may all be free from illness.",
  hi: "सभी सुखी हों, सभी निरोगी हों।",
};
export const mantras: Mantra[] = c.mantras.length ? c.mantras : [FALLBACK];
