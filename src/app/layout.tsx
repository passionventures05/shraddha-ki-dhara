import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@/styles/launch.css";
import { LangProvider } from "@/lib/lang";
import { CartProvider } from "@/lib/useCart";
import { site } from "@/lib/site";
import { Navbar, Footer, WhatsAppFab, AnnounceBar, Petals } from "@/components/ui";
import { JharokhaDefs } from "@/components/ornaments";
import { AartiGlow } from "@/components/home/effects";
import LaunchCeremony from "@/components/LaunchCeremony";
import { bootScript } from "@/lib/launch";

// Fonts are bundled locally (src/fonts) so `npm run dev` / build never needs to reach Google Fonts.
const cormorant = localFont({
  src: [
    { path: "../fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "../fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/cormorant-garamond-latin-600-italic.woff2", weight: "600", style: "italic" },
    { path: "../fonts/cormorant-garamond-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../fonts/cormorant-garamond-latin-700-italic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});
const lora = localFont({
  src: "../fonts/lora-latin-wght-normal.woff2",
  weight: "400 700",
  style: "normal",
  variable: "--font-lora",
  display: "swap",
});
const tiro = localFont({
  src: "../fonts/tiro-devanagari-hindi-devanagari-400-normal.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-tiro",
  display: "swap",
});
const deva = localFont({
  src: "../fonts/noto-serif-devanagari-devanagari-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-deva",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "Shraddha Ki Dhara | Puja Kits & Hindu Dharm",
  description: "Complete puja kits delivered to your door. Where Faith Flows, Shraddha Grows.",
  openGraph: {
    title: "Shraddha Ki Dhara",
    description: "Complete puja kits, delivered to your door.",
    images: [{ url: "/og.jpg", width: 1200, height: 900, alt: "Shraddha Ki Dhara" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
};
export const viewport: Viewport = { themeColor: "#7A1823" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${lora.variable} ${tiro.variable} ${deva.variable}`}>
      <head>
        {/* launch ceremony: decides before the first paint whether the curtains are shown (see src/lib/launch.ts) */}
        <script dangerouslySetInnerHTML={{ __html: bootScript() }} />
      </head>
      <body>
        <noscript><style>{`.reveal{opacity:1!important;transform:none!important}`}</style></noscript>
        <LangProvider>
          <CartProvider>
            <JharokhaDefs />
            <AartiGlow />
            <Petals />
            <AnnounceBar />
            <Navbar />
            <main>{children}</main>
            <Footer />
            <WhatsAppFab />
          </CartProvider>
        </LangProvider>
        <LaunchCeremony />
      </body>
    </html>
  );
}
