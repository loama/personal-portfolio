import Image from "next/image";
import Link from "next/link";
import { Arrow, AudienceSwitch } from "./shell";
import type { Locale } from "@/lib/site";

const copy = {
  en: {
    greeting: "Hi, I'm Eduardo López.", since: "Building products since 2015", contact: "Get in touch", how: "How I work", approach: "Close to the problem. Hands on the code.", cofounder: "Amiloz cofounder", ideas: "ideas → products",
    founder: { title: ["I build software.", "And the companies", "behind it."], intro: "Founder of Supervisor. Building Constructor. Previously cofounder & CTO at Amiloz, part of Y Combinator W22.", action: "See what I'm building", target: "#work", event: "view_work" },
    employee: { title: ["From the idea", "to the product", "that works."], intro: "Full stack engineering, product design, and the experience of building a company. I can help take your next product into production.", action: "Explore my experience", target: "/resume/employee", event: "view_resume" },
  },
  es: {
    greeting: "Hola, soy Eduardo López.", since: "Creando productos desde 2015", contact: "Hablemos", how: "Mi forma de trabajar", approach: "Cerca del problema. Dentro del código.", cofounder: "Cofundador de Amiloz", ideas: "ideas → productos",
    founder: { title: ["Construyo software.", "Y las empresas", "que lo hacen real."], intro: "Fundador de Supervisor. Desarrollando Constructor. Antes, cofundador y CTO de Amiloz, parte de Y Combinator W22.", action: "Lo que estoy construyendo", target: "#work", event: "view_work" },
    employee: { title: ["De la idea", "al producto", "que funciona."], intro: "Ingeniería full stack, diseño de producto y la experiencia de haber construido una empresa. Puedo ayudarte a llevar tu siguiente producto a producción.", action: "Ver mi experiencia", target: "/resume/employee", event: "view_resume" },
  },
};

export function Hero({ locale, mode = "founder" }: { locale: Locale; mode?: "founder" | "employee" }) {
  const labels = copy[locale];
  const profile = labels[mode];
  return <section className="mx-auto grid max-w-[1320px] items-center gap-14 px-5 pb-20 pt-9 sm:px-10 sm:pt-16 lg:grid-cols-[1.55fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
    <div>
      <div className="hero-enter"><AudienceSwitch locale={locale} active={mode} /></div>
      <p className="hero-enter mt-8 text-sm font-medium text-muted">{labels.greeting}</p>
      <h1 className="hero-enter hero-title mt-4 font-medium tracking-[-0.058em]">
        {profile.title[0]}<br /><span className="text-olive">{profile.title[1]}</span><br /><span className="text-olive">{profile.title[2]}</span>
      </h1>
      <p className="hero-enter mt-7 max-w-[490px] text-base leading-[1.75] text-muted sm:text-lg">{profile.intro}</p>
      <div className="hero-enter mt-8 flex flex-wrap items-center gap-6">
        <Link href={`/${locale}${profile.target}`} className="button-primary group" data-track={profile.event}>{profile.action}<span className="button-icon"><Arrow /></span></Link>
        <Link href={`/${locale}${mode === "employee" ? "/work" : ""}#contact`} className="text-sm font-medium underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink">{labels.contact}</Link>
      </div>
      <div className="hero-enter mt-10 flex items-center gap-3 text-xs text-muted"><span className="h-1.5 w-1.5 rounded-full bg-olive" /><span>{labels.since}</span></div>
    </div>
    <div className="portrait-enter relative mx-auto w-full max-w-[430px] lg:mr-0">
      <div className="portrait-shell rounded-[2rem] p-2">
        <div className="relative overflow-hidden rounded-[1.55rem]">
          <Image src="/images/eduardo.webp" alt="Eduardo López" width={800} height={1000} priority sizes="(min-width: 1024px) 410px, (min-width: 640px) 400px, calc(100vw - 56px)" className="aspect-[4/4.7] w-full object-cover" />
          <div className="portrait-shade absolute inset-0" aria-hidden="true" />
          <div className="absolute bottom-7 left-7 right-7 text-white"><p className="text-[11px] uppercase tracking-[.18em] opacity-80">{labels.how}</p><p className="mt-2 max-w-[260px] text-2xl font-medium leading-tight tracking-tight">{labels.approach}</p></div>
        </div>
      </div>
      <div className="founder-note absolute -bottom-6 -left-2 flex items-center gap-3 rounded-2xl px-4 py-3.5 sm:-left-7">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#edf0e6] text-base font-medium text-olive">Y</span>
        <span><span className="block text-xs font-semibold">Y Combinator W22</span><span className="mt-0.5 block text-[11px] text-muted">{labels.cofounder}</span></span>
      </div>
      <span className="absolute -right-1 top-[-18px] hidden rotate-6 rounded-full border border-olive/20 bg-paper px-4 py-2 font-mono text-[10px] text-olive sm:block">{labels.ideas}</span>
    </div>
  </section>;
}
