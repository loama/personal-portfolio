import { notFound } from "next/navigation";
import { isLocale } from "@/lib/site";
import { Header, Contact, Footer } from "@/components/shell";
import { Hero } from "@/components/hero";
import { Projects } from "@/components/projects";
import { About, Experience, FounderStory } from "@/components/experience";
import { getResume } from "@/lib/resume";
import { SITE_URL, contacts } from "@/lib/site";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: { absolute: lang === "es" ? "Eduardo López | Fundador e ingeniero de software" : "Eduardo López | Founder & software engineer" },
    description: getResume(lang, "founder").basics.summary,
    alternates: { canonical: `/${lang}`, languages: { en: "/en", es: "/es", "x-default": "/en" } },
    openGraph: { type: "website", siteName: "Eduardo López", images: [{ url: "/og.png", width: 1200, height: 630 }], locale: lang === "es" ? "es_ES" : "en_US", url: `/${lang}` },
  };
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const structured = { "@context": "https://schema.org", "@type": "Person", name: "Eduardo López", url: SITE_URL, image: `${SITE_URL}/images/eduardo-linkedin.webp`, jobTitle: lang === "es" ? "Fundador e ingeniero de software" : "Founder & software engineer", email: contacts.email, sameAs: [contacts.linkedin, contacts.x, contacts.github], knowsLanguage: ["English", "Spanish"] };
  return <><Header locale={lang} /><main id="main"><Hero locale={lang} /><div className="mx-auto max-w-[1240px] border-t border-ink/10" /><Projects locale={lang} /><FounderStory locale={lang} /><Experience locale={lang} /><About locale={lang} /><div className="px-5 sm:px-10"><Contact locale={lang} /></div></main><Footer locale={lang} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} /></>;
}
