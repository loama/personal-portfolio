import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { StoryNavigation, StoryPageLink } from "@/components/story/navigation";
import { StoryFooter, StorySocials } from "@/components/story/footer";
import { ResumeExperience } from "@/components/resume-experience";
import { ResumeSummary } from "@/components/resume-summary";
import { getResume } from "@/lib/resume";
import { storyCopy } from "@/lib/story-copy";
import { isLocale, isVersion, resumePath, VERSIONS } from "@/lib/site";
import portrait from "../../../../../../public/images/eduardo-portrait.webp";

type Params = Promise<{ lang: string; version: string }>;
export function generateStaticParams() { return VERSIONS.map((version) => ({ version })); }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, version } = await params;
  if (!isLocale(lang) || !isVersion(version)) return {};
  const resume = getResume(lang, version);
  return {
    title: { absolute: `${resume.basics.name} | ${resume.basics.label}` },
    description: resume.basics.summary,
    alternates: { canonical: `/${lang}/resume/${version}`, languages: { en: `/en/v2/resume/${version}`, es: `/es/v2/resume/${version}`, "x-default": `/en/v2/resume/${version}` } },
    openGraph: { type: "website", siteName: "Eduardo López", images: [{ url: "/og.png", width: 1200, height: 630 }], url: `/${lang}/v2/resume/${version}`, locale: lang === "es" ? "es_ES" : "en_US" },
  };
}

export default async function StoryResumePage({ params }: { params: Params }) {
  const { lang, version } = await params;
  if (!isLocale(lang) || !isVersion(version)) notFound();
  const copy = storyCopy[lang];
  const resume = getResume(lang, version);
  return <>
    <StoryNavigation locale={lang} path={`/v2/resume/${version}`} version={version} />
    <main id="main" className="story-cv">
      <section className="story-cv-intro" aria-label={copy.profile}>
        <div className="story-cv-heading">
          <p className="story-eyebrow">{copy.resume}</p>
          <h1>{resume.basics.name}</h1>
          <StorySocials />
        </div>
        <figure className="story-portrait story-cv-portrait">
          <Image src={portrait} alt={resume.basics.name} priority sizes="(max-width: 760px) 112px, 160px" />
        </figure>
        <ResumeSummary resume={resume} />
        <div className="story-cv-tools">
          <nav aria-label={copy.resumeVersion}>
            <StoryPageLink prefetch={false} href={`/${lang}/v2/resume/founder`} aria-current={version === "founder" ? "page" : undefined}>{copy.founder}</StoryPageLink>
            <StoryPageLink prefetch={false} href={`/${lang}/v2/resume/employee`} aria-current={version === "employee" ? "page" : undefined}>{copy.employee}</StoryPageLink>
          </nav>
          <div>
            <a href={resumePath(lang, version, "pdf")} download data-track="download_pdf">{copy.downloadPdf}<span aria-hidden="true"> ↓</span></a>
            <a href={resumePath(lang, version, "pdf", "full")} download data-track="download_pdf_full">{copy.fullPdf}<span aria-hidden="true"> ↓</span></a>
            <a href={resumePath(lang, version, "json")} download data-track="download_json">JSON<span aria-hidden="true"> ↓</span></a>
          </div>
        </div>
      </section>
      <section id="experience" className="story-cv-section">
        <h2>{copy.experience}</h2>
        <ResumeExperience work={resume.work} locale={lang} />
      </section>
      <section className="story-cv-section">
        <h2>{copy.education}</h2>
        {resume.education.map((entry) => <div key={entry.institution} className="story-cv-education"><h3>{entry.institution}</h3><p>{entry.area} · {entry.startDate}</p></div>)}
      </section>
      <section className="story-cv-section">
        <h2>{copy.tools}</h2>
        <p>{resume.skills[0].keywords.join(" · ")}</p>
      </section>
      <section className="story-cv-section">
        <h2>{copy.languages}</h2>
        <p>{resume.languages.map(({ language }) => language).join(" · ")}</p>
      </section>
    </main>
    <StoryFooter locale={lang} version={version} />
  </>;
}
