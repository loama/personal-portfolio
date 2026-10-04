import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DownloadIcon } from "@radix-ui/react-icons";
import { Header, Footer, Arrow } from "@/components/shell";
import { getResume } from "@/lib/resume";
import { ResumeExperience } from "@/components/resume-experience";
import { ResumeSidebar } from "@/components/resume-sidebar";
import { ResumeSummary } from "@/components/resume-summary";
import { SocialIcon } from "@/components/social-icon";
import { ButtonLabel } from "@/components/button-label";
import { Portrait } from "@/components/portrait";
import { Projects } from "@/components/projects";
import { isLocale, isVersion, resumePath, SITE_URL, VERSIONS, contacts } from "@/lib/site";

type Params = Promise<{ lang: string; version: string }>;
export function generateStaticParams() { return VERSIONS.map((version) => ({ version })); }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, version } = await params;
  if (!isLocale(lang) || !isVersion(version)) return {};
  const resume = getResume(lang, version);
  const path = `/${lang}/resume/${version}`;
  return {
    title: { absolute: `${resume.basics.name} | ${resume.basics.label}` },
    description: resume.basics.summary,
    alternates: { canonical: path, languages: { en: `/en/resume/${version}`, es: `/es/resume/${version}`, "x-default": `/en/resume/${version}` } },
    openGraph: { type: "website", siteName: "Eduardo López", images: [{ url: "/og.png", width: 1200, height: 630 }], locale: lang === "es" ? "es_ES" : "en_US", url: path },
  };
}

export default async function ResumePage({ params }: { params: Params }) {
  const { lang, version } = await params;
  if (!isLocale(lang) || !isVersion(version)) notFound();
  const es = lang === "es";
  const resume = getResume(lang, version);
  const structured = {
    "@context": "https://schema.org", "@type": "Person", name: resume.basics.name,
    url: `${SITE_URL}/${lang}/resume/${version}`, image: `${SITE_URL}/images/eduardo-portrait.webp`,
    jobTitle: resume.basics.label, email: contacts.email,
    sameAs: [contacts.linkedin, contacts.x, contacts.github], knowsLanguage: ["English", "Spanish"],
  };

  return <>
    <Header locale={lang} path={`/resume/${version}`} />
    <main id="main" className="mx-auto max-w-[1240px] px-5 pb-20 pt-10 sm:px-10 sm:pt-16">
      <section aria-label={es ? "Perfil" : "Profile"} className="grid items-center gap-14 pb-16 lg:grid-cols-[minmax(0,1fr)_304px] lg:gap-20 lg:pb-20">
        <div>
          <p className="eyebrow">{es ? "Currículum" : "Resume"}</p>
          <h1 className="mt-1 text-[clamp(2.7rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-.05em]">{resume.basics.name}</h1>
          <ResumeSummary resume={resume} />
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href={resumePath(lang, version, "pdf")} download className="button-primary" data-track="download_pdf"><ButtonLabel>{es ? "Descargar PDF" : "Download PDF"}</ButtonLabel><span className="button-icon"><DownloadIcon aria-hidden="true" className="h-4 w-4" /></span></a>
            <a href={resumePath(lang, version, "pdf", "full")} download className="flex min-h-11 items-center gap-2 text-sm font-medium text-accent underline decoration-accent/30 underline-offset-4 hover:text-ink" data-track="download_pdf_full">{es ? "PDF detallado" : "Detailed PDF"}<DownloadIcon aria-hidden="true" className="h-4 w-4" /></a>
            <a href={resumePath(lang, version, "json")} download className="flex min-h-11 items-center gap-2 text-sm font-medium" data-track="download_json">JSON<Arrow /></a>
            <a href={contacts.whatsapp} className="flex min-h-11 items-center gap-2 text-sm" data-track="contact_whatsapp"><SocialIcon platform="whatsapp" />WhatsApp<Arrow /></a>
          </div>
        </div>
        <Portrait locale={lang} />
      </section>
      {version === "founder" && <Projects locale={lang} />}
      <section id="experience" className="grid gap-12 border-t border-ink/10 py-12 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
        <div>
          <h2 className="text-xl font-bold">{es ? "Experiencia" : "Experience"}</h2>
          <ResumeExperience work={resume.work} locale={lang} />
        </div>
        <ResumeSidebar resume={resume} locale={lang} />
      </section>
      {version === "employee" && <Projects locale={lang} />}
    </main>
    <Footer locale={lang} mode={version} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
  </>;
}
