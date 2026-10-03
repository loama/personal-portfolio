import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DownloadIcon } from "@radix-ui/react-icons";
import { Header, Footer, Arrow } from "@/components/shell";
import { getResume } from "@/lib/resume";
import { ResumeExperience } from "@/components/resume-experience";
import { SocialIcon } from "@/components/social-icon";
import { ButtonLabel } from "@/components/button-label";
import { isLocale, isVersion, resumePath, VERSIONS, contacts } from "@/lib/site";

type Params = Promise<{ lang: string; version: string }>;
export function generateStaticParams() { return VERSIONS.map((version) => ({ version })); }
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, version } = await params;
  if (!isLocale(lang) || !isVersion(version)) return {};
  return { title: lang === "es" ? "Currículum" : "Resume", description: getResume(lang, version).basics.summary, alternates: { canonical: `/${lang}/resume/${version}`, languages: { en: `/en/resume/${version}`, es: `/es/resume/${version}` } } };
}

export default async function ResumePage({ params }: { params: Params }) {
  const { lang, version } = await params;
  if (!isLocale(lang) || !isVersion(version)) notFound();
  const es = lang === "es";
  const resume = getResume(lang, version);
  return <><Header locale={lang} path={`/resume/${version}`} mode={version} /><main id="main" className="mx-auto max-w-[1120px] px-5 pb-20 pt-12 sm:px-10 sm:pt-20">
    <div className="flex flex-wrap items-center justify-between gap-5"><span className="eyebrow">{es ? "La experiencia completa" : "The full experience"}</span><nav aria-label={es ? "Versión del currículum" : "Resume version"} className="flex gap-1 rounded-full bg-mist p-1 text-xs">{VERSIONS.map((v) => <Link key={v} href={`/${lang}/resume/${v}`} aria-current={version === v ? "page" : undefined} className={`rounded-full px-4 py-2.5 ${version === v ? "bg-white font-medium shadow-sm" : "text-muted"}`}>{v === "founder" ? (es ? "Fundador" : "Founder") : (es ? "Empleado y consultor" : "Employee & consultant")}</Link>)}</nav></div>
    <h1 className="mt-7 text-[clamp(2.7rem,6vw,4.5rem)] font-bold leading-tight tracking-[-.05em]">{resume.basics.name}</h1><p className="mt-2 text-xl text-accent">{resume.basics.label}</p>
    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
      <a href={resumePath(lang, version, "pdf")} download className="button-primary" data-track="download_pdf"><ButtonLabel>{es ? "Descargar PDF" : "Download PDF"}</ButtonLabel><span className="button-icon"><DownloadIcon aria-hidden="true" className="h-4 w-4" /></span></a>
      <a href={resumePath(lang, version, "pdf", "full")} download className="flex min-h-11 items-center gap-2 text-sm font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:text-ink" data-track="download_pdf_full">{es ? "PDF detallado" : "Detailed PDF"}<DownloadIcon aria-hidden="true" className="h-4 w-4" /></a>
      <a href={resumePath(lang, version, "json")} download className="flex min-h-11 items-center gap-2 text-sm font-medium" data-track="download_json">JSON<Arrow /></a>
      <a href={contacts.whatsapp} className="flex min-h-11 items-center gap-2 text-sm sm:ml-auto" data-track="contact_whatsapp"><SocialIcon platform="whatsapp" />WhatsApp<Arrow /></a>
    </div>
    <div className="mt-10 grid gap-12 border-t border-ink/10 pt-9 lg:grid-cols-[1fr_240px] lg:gap-16">
      <div><p className="text-base leading-[1.85] text-muted">{resume.basics.summary}</p><h2 className="mt-12 text-xl font-bold">{es ? "Experiencia" : "Experience"}</h2><ResumeExperience work={resume.work} locale={lang} /></div>
      <aside className="space-y-10">
        <section><h2 className="text-sm font-semibold">{es ? "Herramientas" : "Tools"}</h2><div className="mt-4 flex flex-wrap gap-2">{resume.skills.flatMap((skill) => skill.keywords).map((skill) => <span key={skill} className="rounded-lg bg-mist px-2.5 py-1.5 text-xs text-muted">{skill}</span>)}</div></section>
        <section><h2 className="text-sm font-semibold">{es ? "Formación" : "Background"}</h2>{resume.education.map((item) => <div key={item.institution} className="mt-4"><p className="text-sm font-medium">{item.institution}</p><p className="mt-1 text-xs leading-relaxed text-muted">{item.area}</p></div>)}</section>
        <section><h2 className="text-sm font-semibold">{es ? "Idiomas" : "Languages"}</h2><p className="mt-3 text-sm text-muted">{es ? "Español e inglés" : "Spanish and English"}</p></section>
        <section><h2 className="text-sm font-semibold">{es ? "Conectar" : "Connect"}</h2><div className="mt-3 flex flex-col items-start text-sm text-muted">
          <a href={`mailto:${contacts.email}`} data-track="contact_email" className="flex min-h-11 max-w-full items-center gap-3 transition-colors hover:text-ink"><SocialIcon platform="email" /><span className="break-all">{contacts.email}</span></a>
          <a href={contacts.linkedin} data-track="social_linkedin" className="flex min-h-11 items-center gap-3 transition-colors hover:text-ink"><SocialIcon platform="linkedin" />LinkedIn</a>
          <a href={contacts.x} data-track="social_x" className="flex min-h-11 items-center gap-3 transition-colors hover:text-ink"><SocialIcon platform="x" />X</a>
        </div></section>
        <Link href={`/${lang}/agents`} className="inline-flex items-center gap-2 text-xs text-accent">{es ? "También disponible por API y MCP" : "Also available through API & MCP"}<Arrow /></Link>
      </aside>
    </div>
  </main><Footer locale={lang} /></>;
}
