import type { Metadata } from "next";
import ProductsView from "@/components/shop/ProductsView";

export const metadata: Metadata = {
  title: "Puja Kits",
  description: "Complete puja kits for Ganesh, Lakshmi, Satyanarayan, Griha Pravesh, Navratri and Rudrabhishek, delivered to your door.",
};

export default function ProductsPage() {
  return <ProductsView />;
}
