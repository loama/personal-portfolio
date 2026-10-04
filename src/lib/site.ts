export const SITE_URL = "https://eduardo-lopez.com";
export const REPOSITORY_URL = "https://github.com/loama/personal-portfolio";
export const LOCALES = ["en", "es"] as const;
export const VERSIONS = ["founder", "employee"] as const;
export const PDF_LENGTHS = ["short", "full"] as const;
export type Locale = (typeof LOCALES)[number];
export type ResumeVersion = (typeof VERSIONS)[number];
export type PdfLength = (typeof PDF_LENGTHS)[number];

export const contacts = {
  email: "hello@eduardo-lopez.com",
  whatsapp: "https://wa.me/34637432670",
  phone: "+34 637 432 670",
  linkedin: "https://www.linkedin.com/in/eduardolopezamaya/",
  x: "https://x.com/eduardo_lop__",
  github: "https://github.com/loama",
};

export function isLocale(value: string): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

export function isVersion(value: string): value is ResumeVersion {
  return VERSIONS.some((version) => version === value);
}

export function resumePath(locale: Locale, version: ResumeVersion, format: "pdf" | "json", length: PdfLength = "short") {
  const suffix = format === "pdf" && length === "full" ? "-full" : "";
  return `/resume/eduardo-lopez-${version}-${locale}${suffix}.${format}`;
}
