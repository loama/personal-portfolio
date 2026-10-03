import { notFound } from "next/navigation";
import { isLocale } from "@/lib/site";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <main id="main" className="mx-auto max-w-7xl px-6 py-32"><h1 className="text-6xl font-semibold">Eduardo López</h1><p className="mt-6">{lang === "es" ? "Fundador e ingeniero de software." : "Founder & software engineer."}</p></main>;
}
