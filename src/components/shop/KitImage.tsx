import type { Product } from "@/types";
import { Diya } from "../ornaments";

/** The kit photo from the CMS, or a golden diya on maroon foil until a photo is added. */
export default function KitImage({ product, className = "" }: { product: Pick<Product, "image" | "name">; className?: string }) {
  if (product.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.image} alt={product.name} loading="lazy" decoding="async" className={`h-full w-full object-cover ${className}`} />;
  }
  return <div className={`metal grid h-full w-full place-items-center text-gold2 ${className}`} role="img" aria-label={product.name}><Diya className="h-16 w-16" /></div>;
}
