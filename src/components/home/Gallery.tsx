"use client";
import { useRef } from "react";
import { useLang } from "@/lib/lang";
import { gallery } from "@/lib/content";
import { Heading, Reveal } from "../ui";
import { Diya, Flower, Icon, Jharokha, Kalash, Lotus } from "../ornaments";

const FILLERS = [Lotus, Diya, Kalash, Flower];

/** Palace-window photo carousel. Photos come from the CMS (Website Content, Gallery photos); until then it shows empty frames. */
export default function Gallery() {
  const { t, lang } = useLang();
  const track = useRef<HTMLDivElement>(null);
  const slides = gallery.length ? gallery : FILLERS.map((_, i) => ({ image: "", caption: "", captionHi: "", key: i }));
  const scroll = (dir: number) => track.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  return (
    <section className="bg-band py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Heading eyebrow={t("galTag")} title={t("galTitle")} />
        <div className="relative">
          <div ref={track} className="gallery-track" tabIndex={0} aria-label={t("galTitle")}>
            {slides.map((g, i) => {
              const Filler = FILLERS[i % FILLERS.length];
              const cap = lang === "hi" ? g.captionHi : g.caption;
              return (
                <Reveal key={g.image || i} delay={i * 80} className="shrink-0 snap-center">
                  <figure className="w-64 md:w-72">
                    <Jharokha className="h-80 w-full">
                      {g.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={g.image} alt={cap} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div className="metal grid h-full place-items-center text-gold2"><div className="text-center"><Filler className="mx-auto h-14 w-14" /><p className="mt-3 px-6 text-sm opacity-90">{t("galSoon")}</p></div></div>
                      )}
                    </Jharokha>
                    {cap && <figcaption className="mt-3 text-center font-display text-xl text-maroon">{cap}</figcaption>}
                  </figure>
                </Reveal>
              );
            })}
          </div>
          <button type="button" className="gal-arrow left-0" onClick={() => scroll(-1)} aria-label={t("galPrev")}><Icon name="left" /></button>
          <button type="button" className="gal-arrow right-0" onClick={() => scroll(1)} aria-label={t("galNext")}><Icon name="right" /></button>
        </div>
      </div>
    </section>
  );
}
