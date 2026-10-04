import Image from "next/image";
import type { Locale } from "@/lib/site";

export function Portrait({ locale }: { locale: Locale }) {
  const es = locale === "es";

  return <div className="portrait-enter relative mx-auto w-full max-w-[304px]">
    <div className="portrait-shell rounded-[2rem] p-2">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.55rem]">
        <Image src="/images/eduardo-linkedin.webp" alt="Eduardo López" fill priority sizes="(min-width: 344px) 288px, calc(100vw - 56px)" className="object-cover" />
      </div>
    </div>
    <div className="founder-note relative -mt-8 ml-4 mr-4 grid gap-3 rounded-2xl px-4 py-4 sm:ml-[-28px] sm:mr-10">
      <div className="flex items-center gap-3">
        <Image src="/images/y-combinator.svg" alt="Y Combinator" width={36} height={36} className="h-9 w-9 flex-none" />
        <span><span className="block text-xs font-semibold">Y Combinator W22</span><span className="mt-0.5 block text-[11px] text-muted">{es ? "Cofundador de Amiloz" : "Amiloz cofounder"}</span></span>
      </div>
      <div className="flex items-center gap-3 border-t border-ink/10 pt-3">
        <Image src="/images/platanus.svg" alt="Platanus Ventures" width={36} height={36} className="h-9 w-9 flex-none rounded bg-black p-1.5" />
        <span><span className="block text-xs font-semibold">Platanus Ventures</span><span className="mt-0.5 block text-[11px] text-muted">{es ? "Generación de fundadores 2023" : "Founder cohort 2023"}</span></span>
      </div>
    </div>
    <span className="absolute -right-1 top-[-18px] hidden rotate-6 rounded-full border border-brand/30 bg-paper px-4 py-2 font-action text-xs uppercase tracking-[.04em] text-ink sm:block">{es ? "ideas → productos" : "ideas → products"}</span>
  </div>;
}
