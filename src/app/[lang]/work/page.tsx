import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Contact, Footer } from "@/components/shell";
import { Hero } from "@/components/hero";
import { Experience, FounderStory } from "@/components/experience";
import { isLocale } from "@/lib/site";
import { getResume } from "@/lib/resume";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: lang === "es" ? "Ingeniería y consultoría" : "Engineering & consulting", description: getResume(lang, "employee").basics.summary, alternates: { canonical: `/${lang}/work`, languages: { en: "/en/work", es: "/es/work" } } };
}

export default async function WorkPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <><Header locale={lang} path="/work" mode="employee" /><main id="main"><Hero locale={lang} mode="employee" /><div className="mx-auto max-w-[1240px] border-t border-ink/10" /><Experience locale={lang} /><FounderStory locale={lang} /><div className="px-5 sm:px-10"><Contact locale={lang} /></div></main><Footer locale={lang} /></>;
}
