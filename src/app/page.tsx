"use client";
import Link from "next/link";
import { useLang, type Lang } from "@/lib/lang";
import { inr, kits, categoryHi } from "@/lib/products";
import { reviews } from "@/lib/content";
import { site, whatsappChatUrl } from "@/lib/site";
import { Foil, Heading, Reveal } from "@/components/ui";
import { Lotus, Diya, Kalash, Leaf, Gift, Flower, Trishul, Mandala, Jharokha, SacredDivider } from "@/components/ornaments";
import MantraOfDay from "@/components/home/MantraOfDay";
import FestivalCountdown from "@/components/home/FestivalCountdown";
import BlessingStrip from "@/components/home/BlessingStrip";
import Gallery from "@/components/home/Gallery";
import LightDiya from "@/components/home/LightDiya";
import { ParallaxMandala } from "@/components/home/effects";
import KitImage from "@/components/shop/KitImage";

const faqs: Record<Lang, [string, string][]> = {
  en: [
    ["How soon should I order?", `Please order at least ${site.leadHours} hours before your puja date.`],
    ["Can I customise a kit?", "Yes. Use the Special Order page to build your own kit or send a bulk enquiry."],
    ["How do I pay?", `Pay a ${site.advancePercent}% advance by UPI to confirm your order, send it to us on WhatsApp, and pay the balance on delivery or pick-up.`],
    ["Can I pick up my order?", "Yes. Choose Pick up at checkout and we will confirm the details with you."],
    ["What is inside each kit?", "Open any kit to see every item. Choose Basic, Standard or Premium to suit your puja."],
    ["Can I read the site in Hindi?", "Yes. Tap the हिं button at the top of any page."],
  ],
  hi: [
    ["कितने समय पहले ऑर्डर करना चाहिए?", `कृपया अपनी पूजा की तारीख़ से कम से कम ${site.leadHours} घंटे पहले ऑर्डर करें।`],
    ["क्या मैं अपना किट अपने अनुसार बना सकता/सकती हूँ?", "हाँ। विशेष ऑर्डर पेज पर अपना किट बनाएँ या थोक पूछताछ भेजें।"],
    ["भुगतान कैसे करूँ?", `ऑर्डर पक्का करने के लिए UPI से ${site.advancePercent}% अग्रिम चुकाएँ, WhatsApp पर हमें भेजें, और शेष राशि डिलीवरी या लेते समय दें।`],
    ["क्या मैं ऑर्डर स्वयं ले सकता/सकती हूँ?", "हाँ। चेकआउट में “स्वयं लें” चुनें, हम विवरण की पुष्टि कर देंगे।"],
    ["हर किट में क्या होता है?", "किसी भी किट को खोलकर हर वस्तु देखें। अपनी पूजा के अनुसार बेसिक, स्टैंडर्ड या प्रीमियम चुनें।"],
    ["क्या मैं साइट हिंदी में पढ़ सकता/सकती हूँ?", "हाँ। हर पेज के ऊपर हिं बटन दबाएँ।"],
  ],
};
const festivalNames: [string, string][] = [
  ["Ganesh Chaturthi", "गणेश चतुर्थी"], ["Navratri", "नवरात्रि"], ["Dussehra", "दशहरा"], ["Dhanteras", "धनतेरस"], ["Diwali", "दीवाली"],
  ["Satyanarayan Katha", "सत्यनारायण कथा"], ["Griha Pravesh", "गृह प्रवेश"], ["Mahashivratri", "महाशिवरात्रि"], ["Janmashtami", "जन्माष्टमी"], ["Ram Navami", "राम नवमी"],
];

function KitIcon({ category }: { category: string }) {
  const c = "h-14 w-14";
  switch (category) {
    case "Ganesh": return <span className="font-display text-5xl leading-none">ॐ</span>;
    case "Lakshmi": return <Lotus className="h-10 w-16" />;
    case "Vrat Katha": return <Kalash className={c} />;
    case "Home": return <Diya className={c} />;
    case "Devi": return <Flower className={c} />;
    default: return <Trishul className={c} />;
  }
}

export default function Home() {
  const { t, tf, lang } = useLang();
  return (
    <>
      {/* Hero banner: 4:3 on phones, wide on laptops */}
      <section>
        <picture>
          <source media="(min-width: 768px)" srcSet="/banner-desktop.webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/banner-mobile.webp" width={1448} height={1086} fetchPriority="high" alt={`${site.name}. ${t("sub")} ${t("tag")}`} className="block h-auto w-full" />
        </picture>
        <h1 className="sr-only">{site.name}</h1>
        <Foil />
      </section>

      <Reveal className="px-4 pb-6 pt-12 text-center">
        <p className="font-display text-3xl italic text-maroon md:text-4xl">{t("tag")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          <Link href="/products/" className="btn">{t("shop")}</Link>
          <Link href="/blogs/" className="btn btn-gold">{t("watch")}</Link>
        </div>
        <ul className="mt-10 flex flex-wrap justify-center gap-3">
          {(["trust1", "trust2", "trust3"] as const).map((k) => <li key={k} className="chip"><span className="text-gold">✦</span>{t(k)}</li>)}
        </ul>
      </Reveal>

      <MantraOfDay />
      <FestivalCountdown />

      {/* Festival marquee */}
      <section className="metal mt-20"><Foil />
        <div className="marquee py-4">
          <div className="marquee-track font-display text-2xl">
            {[...festivalNames, ...festivalNames].map(([e, h], i) => (
              <span key={i} className="whitespace-nowrap px-6">{lang === "en" ? e : h}<span className="ml-12 text-gold2">✦</span></span>
            ))}
          </div>
        </div><Foil />
      </section>

      {/* Shop by puja */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <Heading title={t("shopBy")} eyebrow={t("products")} />
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8">
          {kits.map((k, i) => (
            <Reveal key={k.id} delay={i * 80} className="h-full">
              <Link href={`/products/?cat=${encodeURIComponent(k.category)}`} className="card card-glow block h-full p-4 text-center transition duration-300 hover:-translate-y-2 md:p-6">
                <Jharokha className="mx-auto mb-4 h-44 w-32 md:h-52 md:w-40">
                  {k.image ? <KitImage product={k} /> : <div className="metal grid h-full place-items-center text-gold2"><KitIcon category={k.category} /></div>}
                </Jharokha>
                <h3 className="text-2xl md:text-3xl">{lang === "hi" ? k.nameHi : k.name}</h3>
                <p className="text-xs uppercase tracking-[.2em] text-gold3">{lang === "hi" ? categoryHi(k.category) : k.category}</p>
                <p className="mt-1 text-gold3">{lang === "en" ? `${t("from")} ${inr(k.prices[0])}` : `${inr(k.prices[0])} ${t("from")}`}</p>
                <span className="mt-3 inline-block text-sm text-emerald">{t("shop")} →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <BlessingStrip />

      {/* How it works */}
      <section className="mt-24 bg-band py-24"><div className="mx-auto max-w-5xl px-4">
        <Heading title={t("how")} />
        <div className="grid gap-8 md:grid-cols-3">
          {([["s1", "s1d"], ["s2", "s2d"], ["s3", "s3d"]] as const).map(([s, d], i) => (
            <Reveal key={s} delay={i * 120} className="h-full">
              <div className="card card-glow h-full p-6 text-center">
                <div className="metal mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border-2 border-gold font-display text-3xl text-gold2">{i + 1}</div>
                <h3 className="text-2xl">{t(s)}</h3>
                <p className="mt-2 text-sm">{t(d)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div></section>

      {/* Why us */}
      <section className="metal"><Foil />
        <div className="mx-auto max-w-6xl px-4 py-24">
          <Heading title={t("why")} light />
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {([[Flower, "w1", "w1d"], [Leaf, "w2", "w2d"], [Gift, "w3", "w3d"], [Kalash, "w4", "w4d"]] as const).map(([Icon, k, d], i) => (
              <Reveal key={k} delay={i * 100}>
                <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full border border-gold2/70 text-gold2"><Icon className="h-10 w-10" /></div>
                <p className="font-display text-2xl text-gold2">{t(k)}</p>
                <p className="mt-1 text-sm opacity-90">{t(d)}</p>
              </Reveal>
            ))}
          </div>
        </div><Foil />
      </section>

      {/* Our story, with a diya to light */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-12 overflow-hidden px-4 py-24 md:grid-cols-2">
        <Reveal>
          <Jharokha className="relative mx-auto h-[28rem] w-72 md:w-80">
            <div className="metal grid h-full place-items-center">
              <div aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}><Mandala className="spin-slow h-80 w-80 text-gold2 opacity-30" /></div>
              <div className="text-center"><LightDiya /><p className="gold-text -mt-2 font-display text-6xl">ॐ</p></div>
            </div>
          </Jharokha>
        </Reveal>
        <Reveal className="text-center md:text-left" delay={150}>
          <p className="mb-2 text-xs font-medium uppercase tracking-[.3em] text-gold3">{t("storyTag")}</p>
          <h2 className="foil-title text-4xl md:text-6xl">{t("storyTitle")}</h2>
          <SacredDivider kind="swastika" className="my-4 md:!justify-start" />
          <p className="text-lg">{t("storyP1")}</p>
          <p className="mt-4 text-lg">{t("storyP2")}</p>
          <Link href="/products/" className="btn mt-8">{t("shop")}</Link>
        </Reveal>
      </section>

      <Gallery />

      {/* Reviews (edited in the CMS) */}
      {reviews.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-24">
          <Heading title={t("love")} />
          <div className="grid gap-8 md:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.name + i} delay={i * 100} className="h-full">
                <figure className="card card-glow h-full p-7">
                  <span className="font-display text-6xl leading-none text-gold" aria-hidden>“</span>
                  <blockquote className="-mt-3 text-lg italic">{lang === "hi" ? r.textHi : r.text}</blockquote>
                  <figcaption className="mt-4 font-medium text-gold3">— {lang === "hi" ? r.nameHi : r.name}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-24">
        <Heading title={t("faq")} />
        {faqs[lang].map(([q, a]) => <details key={q} className="card mb-4"><summary>{q}</summary><p className="mt-3">{a}</p></details>)}
      </section>

      {/* Closing invitation */}
      <section className="metal"><Foil />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center">
          <ParallaxMandala className="h-[30rem] w-[30rem] text-gold2 opacity-15" />
          <Lotus className="mx-auto h-12 w-20 text-gold2" />
          <h2 className="foil-title mt-3 text-4xl md:text-6xl">{t("ctaTitle")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-lg italic opacity-90">{t("ctaSub")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <a href={whatsappChatUrl} target="_blank" rel="noreferrer" className="btn btn-gold">{t("ctaWa")}</a>
            <Link href="/products/" className="btn btn-ghost">{t("shop")}</Link>
          </div>
          <p className="mt-8 text-xs opacity-70">{tf("announce", { h: site.leadHours })}</p>
        </div><Foil />
      </section>
    </>
  );
}
