import type { Metadata } from "next";
import Checkout from "@/components/checkout/Checkout";

export const metadata: Metadata = { title: "Your Cart", robots: { index: false, follow: true } };

export default function CartPage() {
  return <Checkout />;
}
