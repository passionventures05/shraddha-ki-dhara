"use client";
import { useLang } from "@/lib/lang";
import { videos } from "@/lib/content";
import { site } from "@/lib/site";
import { Heading } from "@/components/ui";

const idOf = (u: string) => u.match(/(?:v=|shorts\/|youtu\.be\/)([\w-]{6,})/)?.[1] ?? "";
export default function Blogs() {
  const { t, lang } = useLang();
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <Heading eyebrow={t("blogs")} title={t("blogs")} sub={t("sub")} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <a key={v.url} href={v.url} target="_blank" rel="noreferrer" className="card card-glow group overflow-hidden transition hover:-translate-y-1">
            <div className="metal relative aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.thumb || `https://i.ytimg.com/vi/${idOf(v.url)}/hqdefault.jpg`} alt={lang === "hi" ? v.titleHi : v.title} className="absolute inset-0 z-[2] h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
              <span className="absolute inset-0 z-[3] grid place-items-center"><span className="grid h-14 w-14 place-items-center rounded-full border-2 border-gold2 bg-ruby/90 text-xl text-cream">▶</span></span>
            </div>
            <div className="p-4"><h3 className="text-2xl">{lang === "hi" ? v.titleHi : v.title}</h3><p className="text-sm text-emerald">{t("open")}</p></div>
          </a>
        ))}
      </div>
      <div className="mt-10 text-center"><a href={site.youtube} target="_blank" rel="noreferrer" className="btn btn-gold">{t("visit")}</a></div>
    </section>
  );
}
