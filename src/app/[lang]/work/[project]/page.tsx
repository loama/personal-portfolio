import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Contact, Arrow } from "@/components/shell";
import { CASE_IDS, caseStudies, isCaseId } from "@/lib/case-studies";
import { profile } from "@/lib/resume";
import { isLocale } from "@/lib/site";

const labels = {
  en: { back: "Back to my work", areas: "Areas of responsibility", work: "The work", fullResume: "Read the full resume", based: "Based on my career record.", next: "Next", period: "Amiloz / 2021 to 2022", source: "Inspect the public change" },
  es: { back: "Volver a mi trabajo", areas: "Áreas de responsabilidad", work: "El trabajo", fullResume: "Ver el currículum completo", based: "Basado en mi historial profesional.", next: "Siguiente", period: "Amiloz / 2021 a 2022", source: "Ver el cambio público" },
};
const companyNames = { amiloz: "Amiloz", nixtla: "Nixtla" };

type Params = Promise<{ lang: string; project: string }>;
export function generateStaticParams() { return CASE_IDS.map((project) => ({ project })); }
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, project } = await params;
  if (!isLocale(lang) || !isCaseId(project)) return {};
  const copy = caseStudies[project][lang];
  return { title: `${companyNames[project]} | ${copy.title}`, description: copy.intro, alternates: { canonical: `/${lang}/work/${project}`, languages: { en: `/en/work/${project}`, es: `/es/work/${project}` } } };
}

export default async function CaseStudy({ params }: { params: Params }) {
  const { lang, project } = await params;
  if (!isLocale(lang) || !isCaseId(project)) notFound();
  const study = caseStudies[project];
  const copy = study[lang];
  const work = profile.work.find((work) => work.id === project)!;
  const ui = labels[lang];
  const nextProject = project === "amiloz" ? "nixtla" : "amiloz";
  return <>
    <Header locale={lang} path={`/work/${project}`} mode={study.version} />
    <main id="main">
      <article className="mx-auto max-w-[1240px] px-5 pb-16 pt-12 sm:px-10 sm:pt-24">
        <Link href={`/${lang}${study.version === "employee" ? "/work" : ""}`} className="inline-flex min-h-11 items-center gap-2 text-xs text-muted"><span aria-hidden="true">←</span>{ui.back}</Link>
        <div className="mt-9 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <div><p className="eyebrow">{work.name} · {work.position[lang]}</p><h1 className="mt-5 max-w-[760px] text-[clamp(2.8rem,6vw,5rem)] font-medium leading-[1.04] tracking-[-.055em]">{copy.title}</h1></div>
          <div className="lg:self-end"><p className="text-lg leading-[1.75] text-muted">{copy.intro}</p><a href={work.url} className="mt-7 inline-flex min-h-11 items-center gap-3 text-sm font-medium">{copy.link}<Arrow /></a></div>
        </div>
        <section aria-label={ui.areas} className={`mt-16 overflow-hidden rounded-[2rem] p-7 sm:p-12 ${project === "amiloz" ? "bg-[#e5e9dc]" : "bg-[#e6e8e6]"}`}>
          <div className="flex flex-wrap items-center justify-between gap-4"><p className="eyebrow">{ui.areas}</p><p className="font-mono text-[10px] uppercase tracking-widest text-muted">{project === "amiloz" ? ui.period : "Nixtla / Web"}</p></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr">{copy.scope.map((area, index) => <div key={area} className="rounded-[1.3rem] border border-white/60 bg-white/70 p-6"><span className="font-mono text-xs text-olive">0{index + 1}</span><h2 className={`${project === "nixtla" ? "mt-4" : "mt-12"} text-xl font-medium leading-tight tracking-tight`}>{area}</h2></div>)}</div>
          <p className="mt-8 max-w-[670px] text-sm leading-[1.85] text-muted">{copy.context}</p>
        </section>
        <div className="mt-16 grid gap-12 lg:grid-cols-[.55fr_1fr] lg:gap-24">
          <aside><p className="eyebrow">{ui.work}</p><p className="mt-6 max-w-sm text-2xl font-medium leading-[1.5] tracking-tight">{copy.takeaway}</p><Link href={`/${lang}/resume/${study.version}`} className="mt-8 inline-flex min-h-11 items-center gap-3 text-sm text-olive">{ui.fullResume}<Arrow /></Link></aside>
          <div>{copy.sections.map((section, index) => <section key={section.title} className="border-t border-ink/15 pb-12 pt-7"><p className="font-mono text-[10px] text-olive">0{index + 1}</p><h2 className="mt-4 text-2xl font-medium tracking-tight">{section.title}</h2><p className="mt-5 text-base leading-[1.9] text-muted">{section.body}</p>{"source" in section && <a href={section.source} className="mt-5 inline-flex min-h-11 items-center gap-3 text-sm font-medium text-olive">{ui.source}<Arrow /></a>}</section>)}</div>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-5 border-t border-ink/15 pt-7 text-xs text-muted"><p>{ui.based} <a href="https://www.linkedin.com/in/eduardolopezamaya/" className="underline underline-offset-4">LinkedIn</a></p><Link href={`/${lang}/work/${nextProject}`} className="inline-flex items-center gap-3 text-ink">{ui.next}: {companyNames[nextProject]}<Arrow /></Link></div>
      </article>
      <div className="px-5 sm:px-10"><Contact locale={lang} /></div>
    </main>
    <Footer locale={lang} />
  </>;
}
