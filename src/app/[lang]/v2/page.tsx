import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryNavigation } from "@/components/story/navigation";
import { StoryFigure } from "@/components/story/figure";
import { StoryFooter, StorySocials } from "@/components/story/footer";
import { ResumeSummary } from "@/components/resume-summary";
import { getResume } from "@/lib/resume";
import { getStory } from "@/lib/story";
import { storyCopy } from "@/lib/story-copy";
import { contacts, isLocale, SITE_URL } from "@/lib/site";
import portrait from "../../../../public/images/eduardo-portrait.webp";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: { absolute: `Eduardo López | ${getResume(lang).basics.label}` },
    description: getResume(lang).basics.summary,
    alternates: { canonical: `/${lang}/v2`, languages: { en: "/en/v2", es: "/es/v2", "x-default": "/en/v2" } },
    openGraph: { type: "website", siteName: "Eduardo López", images: [{ url: "/og.png", width: 1200, height: 630 }], url: `/${lang}/v2`, locale: lang === "es" ? "es_ES" : "en_US" },
  };
}

export default async function StoryPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const copy = storyCopy[lang];
  const chapters = getStory(lang);
  const resume = getResume(lang);
  const navigation = [{ id: "about", label: copy.about }, ...chapters.map(({ id, label }) => ({ id, label })), { id: "say-hi", label: copy.contact }];
  const structured = { "@context": "https://schema.org", "@type": "Person", name: resume.basics.name, jobTitle: resume.basics.label, url: `${SITE_URL}/${lang}/v2`, image: `${SITE_URL}/images/eduardo-portrait.webp`, email: contacts.email, sameAs: [contacts.linkedin, contacts.x, contacts.github] };

  return <>
    <StoryNavigation locale={lang} chapters={navigation} />
    <main id="main" className="story-main">
      <section className="story-hero" id="about" aria-labelledby="story-title">
        <div className="story-hero-grid">
          <div className="story-introduction">
            <p className="story-eyebrow">{copy.about}</p>
            <h1 id="story-title">{copy.greeting}</h1>
            <ResumeSummary resume={resume} />
            <StorySocials />
          </div>
          <figure className="story-portrait">
            <Image src={portrait} alt="Eduardo López" priority sizes="(max-width: 760px) 320px, 400px" />
            <figcaption><span>Fig 0</span><span>{copy.portrait}</span></figcaption>
          </figure>
        </div>
        <a className="story-scroll" href={`#${chapters[0].id}`}>{copy.scroll} <span aria-hidden="true">↓</span></a>
      </section>
      <div className="story-chapters">
        {chapters.map((chapter, index) => <section key={chapter.id} className="story-chapter" id={chapter.id} aria-labelledby={`${chapter.id}-title`}>
          <StoryFigure kind={chapter.scene} number={index + 1} label={chapter.figure} locale={lang} />
          <div className="story-chapter-text">
            <p className="story-eyebrow">{chapter.label}</p>
            <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
            {chapter.paragraphs.map(({ text, label }) => <p key={text}>{label && <strong>{label}. </strong>}{text}</p>)}
            {chapter.url && <a className="story-inline-link" href={chapter.url} data-track={chapter.id === "supervisor" || chapter.id === "constructor" ? `project_${chapter.id}` : undefined}>{chapter.company}<span aria-hidden="true"> ↗</span></a>}
            {chapter.id === "freelance" && <Link prefetch={false} className="story-inline-link" href={`/${lang}/v2/resume/founder#experience-consulting`}>{lang === "es" ? "Más sobre estos proyectos" : "More about these projects"}<span aria-hidden="true"> ↗</span></Link>}
          </div>
        </section>)}
      </div>
    </main>
    <StoryFooter locale={lang} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
  </>;
}
