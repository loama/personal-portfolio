import Image from "next/image";
import Link from "next/link";
import { Arrow, AudienceSwitch } from "./shell";
import { ButtonLabel } from "./button-label";
import type { Locale } from "@/lib/site";

const copy = {
  en: {
    greeting: "Hi, I'm Eduardo López.", since: "Building products since 2015", contact: "Get in touch", how: "How I work", approach: "Close to the problem. Hands on the code.", cofounder: "Amiloz cofounder", cohort: "Founder cohort 2023", ideas: "ideas → products",
    founder: { title: ["I build software.", "And the ", "behind it."], highlight: "companies", intro: "Founder of Supervisor. Building Constructor. Previously cofounder & CTO at Amiloz, part of Y Combinator W22.", action: "See what I'm building", target: "#work", event: "view_work" },
    employee: { title: ["From the idea", "to the ", "that works."], highlight: "product", intro: "Full stack engineering, product design, and the experience of building a company. I can help take your next product into production.", action: "Explore my experience", target: "/resume/employee", event: "view_resume" },
  },
  es: {
    greeting: "Hola, soy Eduardo López.", since: "Creando productos desde 2015", contact: "Hablemos", how: "Mi forma de trabajar", approach: "Cerca del problema. Dentro del código.", cofounder: "Cofundador de Amiloz", cohort: "Generación de fundadores 2023", ideas: "ideas → productos",
    founder: { title: ["Construyo software.", "Y las ", "que lo hacen real."], highlight: "empresas", intro: "Fundador de Supervisor. Desarrollando Constructor. Antes, cofundador y CTO de Amiloz, parte de Y Combinator W22.", action: "Lo que estoy construyendo", target: "#work", event: "view_work" },
    employee: { title: ["De la idea", "al ", "que funciona."], highlight: "producto", intro: "Ingeniería full stack, diseño de producto y la experiencia de haber construido una empresa. Puedo ayudarte a llevar tu siguiente producto a producción.", action: "Ver mi experiencia", target: "/resume/employee", event: "view_resume" },
  },
};

export function Hero({ locale, mode = "founder" }: { locale: Locale; mode?: "founder" | "employee" }) {
  const labels = copy[locale];
  const profile = labels[mode];
  return <section className="mx-auto grid max-w-[1320px] items-center gap-14 px-5 pb-20 pt-9 sm:px-10 sm:pt-16 lg:grid-cols-[1.55fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
    <div>
      <div className="hero-enter"><AudienceSwitch locale={locale} active={mode} /></div>
      <p className="eyebrow hero-enter mt-8">{labels.greeting}</p>
      <h1 className="hero-enter hero-title mt-4 font-bold tracking-[-0.058em]">
        {profile.title[0]}<br />{profile.title[1]}<span className="text-brand">{profile.highlight}</span><br />{profile.title[2]}
      </h1>
      <p className="hero-enter mt-7 max-w-[490px] text-base leading-[1.75] text-muted sm:text-lg">{profile.intro}</p>
      <div className="hero-enter mt-8 flex flex-wrap items-center gap-6">
        <Link href={`/${locale}${profile.target}`} className="button-primary" data-track={profile.event}><ButtonLabel>{profile.action}</ButtonLabel><span className="button-icon"><Arrow /></span></Link>
        <Link href={`/${locale}${mode === "employee" ? "/work" : ""}#contact`} className="text-sm font-medium underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink">{labels.contact}</Link>
      </div>
      <div className="hero-enter mt-10 flex items-center gap-3 text-xs text-muted"><span className="h-1.5 w-1.5 rounded-full bg-brand" /><span>{labels.since}</span></div>
    </div>
    <div className="portrait-enter relative mx-auto w-full max-w-[320px]">
      <div className="portrait-shell rounded-[2rem] p-2">
        <div className="relative overflow-hidden rounded-[1.55rem]">
          <Image src="/images/eduardo-linkedin.webp" alt="Eduardo López" width={800} height={800} priority sizes="(min-width: 360px) 304px, calc(100vw - 56px)" className="aspect-square w-full object-contain" />
          <div className="portrait-shade absolute inset-0" aria-hidden="true" />
          <div className="absolute bottom-7 left-5 right-5 text-white sm:left-7 sm:right-7"><p className="text-[11px] uppercase tracking-[.18em] opacity-80">{labels.how}</p><p className="mt-2 max-w-[260px] text-xl font-medium leading-tight tracking-tight sm:text-2xl">{labels.approach}</p></div>
        </div>
      </div>
      <div className="founder-note relative -mt-8 ml-4 mr-4 grid gap-3 rounded-2xl px-4 py-4 sm:ml-[-28px] sm:mr-10">
        <div className="flex items-center gap-3">
          <Image src="/images/y-combinator.svg" alt="Y Combinator" width={36} height={36} className="h-9 w-9 flex-none" />
          <span><span className="block text-xs font-semibold">Y Combinator W22</span><span className="mt-0.5 block text-[11px] text-muted">{labels.cofounder}</span></span>
        </div>
        <div className="flex items-center gap-3 border-t border-ink/10 pt-3">
          <Image src="/images/platanus.svg" alt="Platanus Ventures" width={36} height={36} className="h-9 w-9 flex-none rounded bg-ink p-1.5" />
          <span><span className="block text-xs font-semibold">Platanus Ventures</span><span className="mt-0.5 block text-[11px] text-muted">{labels.cohort}</span></span>
        </div>
      </div>
      <span className="absolute -right-1 top-[-18px] hidden rotate-6 rounded-full border border-brand/30 bg-paper px-4 py-2 font-action text-xs uppercase tracking-[.04em] text-ink sm:block">{labels.ideas}</span>
    </div>
  </section>;
}
