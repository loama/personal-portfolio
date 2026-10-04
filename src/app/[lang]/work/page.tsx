import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/site";

export default async function WorkPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  permanentRedirect(`/${lang}/resume/employee`);
}
