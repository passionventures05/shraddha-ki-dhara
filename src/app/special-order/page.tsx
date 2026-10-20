import type { Metadata } from "next";
import SpecialOrder from "@/components/shop/SpecialOrder";

export const metadata: Metadata = { title: "Special Order", description: "Build your own puja kit, or send a wedding and bulk enquiry." };

export default function SpecialPage() {
  return <SpecialOrder />;
}
