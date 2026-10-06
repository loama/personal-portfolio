import Image from "next/image";
import type { Locale } from "@/lib/site";
import portraitImage from "../../public/images/eduardo-portrait.webp";

export function Portrait({ locale }: { locale: Locale }) {
  const es = locale === "es";

  return <div className="portrait-enter relative mx-auto w-full max-w-[304px]">
    <div className="portrait-shell mx-auto w-3/4 rounded-3xl p-1.5">
      <div className="overflow-hidden rounded-[18px]">
        <Image src={portraitImage} alt="Eduardo López" priority sizes="(min-width: 344px) 216px, calc(75vw - 42px)" className="block h-auto w-full object-contain" />
      </div>
    </div>
    <div className="founder-note relative ml-4 mr-4 mt-4 grid gap-3 rounded-2xl px-4 py-4 sm:ml-[-28px] sm:mr-10">
      <div className="flex items-center gap-3">
        <Image src="/images/y-combinator.svg" alt="Y Combinator" width={36} height={36} className="h-9 w-9 flex-none" />
        <span><span className="block text-xs font-semibold">Y Combinator W22</span><span className="mt-0.5 block text-[11px] text-muted">{es ? "Cofundador de amiloz" : "amiloz cofounder"}</span></span>
      </div>
      <a href="https://platan.us/" className="flex items-center gap-3 border-t border-ink/10 pt-3">
        <span aria-hidden="true" className="platanus-logo h-9 w-9 flex-none" />
        <span><span className="block text-xs font-semibold underline decoration-ink/30 underline-offset-4">Platanus Ventures</span><span className="mt-0.5 block text-[11px] text-muted">{es ? "Generación de fundadores 2023" : "Founder cohort 2023"}</span></span>
      </a>
    </div>
  </div>;
}
