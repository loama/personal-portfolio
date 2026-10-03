import { z } from "zod";
import sourceProfile from "../../content/profile.json";
import { contacts, LOCALES, SITE_URL, VERSIONS, type Locale, type ResumeVersion } from "./site";

const translatedText = z.strictObject({ en: z.string().min(1), es: z.string().min(1) });
const translatedHighlights = z.strictObject({ en: z.array(z.string().min(1)), es: z.array(z.string().min(1)) });
const resumeDate = z.string().regex(/^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/);

export const profileSchema = z.strictObject({
  updated: z.iso.date(),
  name: z.string().min(1),
  summary: z.strictObject({ founder: translatedText, employee: translatedText }),
  work: z.array(z.strictObject({
    id: z.string().min(1),
    name: z.string().min(1),
    nameEs: z.string().min(1).optional(),
    url: z.url().optional(),
    startDate: resumeDate.optional(),
    endDate: resumeDate.optional(),
    position: translatedText,
    summary: translatedText,
    highlights: translatedHighlights,
  })).min(1),
  publicWork: z.array(z.strictObject({ project: z.string().min(1), url: z.url(), title: translatedText, body: translatedText })),
  skills: z.array(z.string().min(1)),
  languages: z.array(translatedText),
  education: z.array(z.strictObject({
    institution: z.string().min(1),
    area: translatedText,
    startDate: resumeDate,
  })),
  sources: z.array(z.url()),
});

export const profile = profileSchema.parse(sourceProfile);

export const resumeQuerySchema = z.strictObject({
  lang: z.enum(LOCALES).default("en"),
  version: z.enum(VERSIONS).default("founder"),
  format: z.enum(["json", "pdf"]).default("json"),
});

const workPriority: Record<ResumeVersion, string[]> = {
  founder: ["supervisor", "amiloz", "nixtla", "consulting"],
  employee: ["supervisor", "nixtla", "amiloz", "consulting"],
};

export function getResume(locale: Locale = "en", version: ResumeVersion = "founder") {
  const priority = workPriority[version];
  const rank = (id: string) => {
    const index = priority.indexOf(id);
    return index === -1 ? priority.length : index;
  };

  return {
    basics: {
      name: profile.name,
      label: version === "founder"
        ? (locale === "en" ? "Founder and full stack AI engineer" : "Fundador e ingeniero full stack de IA")
        : (locale === "en" ? "Full stack AI engineer" : "Ingeniero full stack de IA"),
      email: contacts.email,
      phone: contacts.phone,
      url: SITE_URL,
      summary: profile.summary[version][locale],
      profiles: [
        { network: "LinkedIn", username: "eduardolopezamaya", url: contacts.linkedin },
        { network: "GitHub", username: "loama", url: contacts.github },
        { network: "X", username: "eduardo_lop__", url: contacts.x },
      ],
    },
    work: [...profile.work].sort((a, b) => rank(a.id) - rank(b.id)).map((work) => ({
      name: locale === "es" ? (work.nameEs ?? work.name) : work.name,
      position: work.position[locale],
      ...(work.url ? { url: work.url } : {}),
      ...(work.startDate ? { startDate: work.startDate } : {}),
      ...(work.endDate ? { endDate: work.endDate } : {}),
      summary: work.summary[locale],
      highlights: [...work.highlights[locale]],
    })),
    education: profile.education.map((education) => ({
      institution: education.institution,
      area: education.area[locale],
      startDate: education.startDate,
    })),
    skills: [{
      name: locale === "en" ? "Engineering and product" : "Ingeniería y producto",
      keywords: [...profile.skills],
    }],
    languages: profile.languages.map((language) => ({ language: language[locale] })),
    projects: profile.work.filter((work) => work.id === "supervisor").flatMap((work) => {
      const supervisor = {
        name: work.name,
        description: work.summary[locale],
        highlights: [...work.highlights[locale]],
        ...(work.url ? { url: work.url } : {}),
      };
      const constructorDescription = work.highlights[locale].find((highlight) => highlight.includes("Constructor"));
      const constructorUrl = profile.sources.find((url) => new URL(url).hostname === "useconstructor.com");
      return constructorDescription && constructorUrl
        ? [supervisor, { name: "Constructor", description: constructorDescription, highlights: [], url: constructorUrl }]
        : [supervisor];
    }),
    meta: {
      language: locale,
      version,
      lastModified: profile.updated,
      sources: [...profile.sources],
    },
  };
}

export type Resume = ReturnType<typeof getResume>;
