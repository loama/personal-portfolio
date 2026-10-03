import type { MetadataRoute } from "next";
import { LOCALES, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) => ["", "/work", "/work/amiloz", "/work/nixtla", "/resume/founder", "/resume/employee", "/agents", "/privacy"].map((path) => ({ url: `${SITE_URL}/${locale}${path}`, lastModified: "2026-10-03", alternates: { languages: { en: `${SITE_URL}/en${path}`, es: `${SITE_URL}/es${path}` } } })));
}
