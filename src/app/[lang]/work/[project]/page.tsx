import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/site";

const projects = ["amiloz", "nixtla"] as const;

export function generateStaticParams() {
  return projects.map((project) => ({ project }));
}

export default async function PreviousProjectPage({ params }: { params: Promise<{ lang: string; project: string }> }) {
  const { lang, project } = await params;
  if (!isLocale(lang) || !projects.some((name) => name === project)) notFound();
  const version = project === "nixtla" ? "employee" : "founder";
  permanentRedirect(`/${lang}/resume/${version}#experience-${project}`);
}
