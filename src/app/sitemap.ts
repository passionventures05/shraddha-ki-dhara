import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/products/", "/special-order/", "/blogs/"].map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.8 }));
}
