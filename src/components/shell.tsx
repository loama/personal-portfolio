import Link from "next/link";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { contacts, type Locale, type ResumeVersion } from "@/lib/site";
import { SocialIcon } from "./social-icon";
import { ThemeSwitcher } from "./theme-switcher";

export function Arrow({ className = "" }: { className?: string }) {
  return <ArrowTopRightIcon aria-hidden="true" className={`h-4 w-4 ${className}`} />;
}

export function Header({ locale, path = "" }: { locale: Locale; path?: string }) {
  const es = locale === "es";
  return (
    <header className="relative z-20 mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-4 px-5 pb-5 pt-7 sm:px-10">
      <Link href={`/${locale}/resume/founder`} className="wordmark col-start-1 row-start-1 inline-flex min-h-11 flex-col items-start justify-center gap-0.5" aria-label={es ? "Eduardo López, inicio" : "Eduardo López, home"}>
        <span className="font-display text-lg font-semibold leading-5 tracking-tight">eduardo lopez<span className="text-brand">.</span></span>
        <span className="text-xs leading-4 text-muted">{es ? 'puedes llamarme "edu"' : 'you can call me "edu"'}</span>
      </Link>
      <div className="contents sm:col-start-2 sm:row-start-1 sm:flex sm:items-center sm:justify-end sm:gap-3">
        <ThemeSwitcher locale={locale} className="col-span-2 row-start-2 justify-self-end" />
        <nav aria-label={es ? "Idioma" : "Language"} className="col-start-2 row-start-1 flex items-center justify-self-end gap-1 text-xs font-semibold">
          {(["en", "es"] as const).map((lang) => <Link key={lang} href={`/${lang}${path}`} scroll={false} hrefLang={lang} lang={lang} aria-current={lang === locale ? "page" : undefined} className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 py-2 transition-colors ${lang === locale ? "bg-ink text-paper" : "text-muted hover:bg-mist"}`}>{lang.toUpperCase()}</Link>)}
        </nav>
      </div>
    </header>
  );
}

export function Footer({ locale, mode = "founder" }: { locale: Locale; mode?: ResumeVersion }) {
  const alternate = mode === "founder" ? "employee" : "founder";
  return <footer className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-7 px-5 py-10 text-xs text-muted sm:px-10">
    <p>© 2026 Eduardo López</p>
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
      <a href={contacts.linkedin} data-track="social_linkedin" className="inline-flex items-center gap-2"><SocialIcon platform="linkedin" />LinkedIn</a>
      <a href={contacts.x} data-track="social_x" className="inline-flex items-center gap-2"><SocialIcon platform="x" />X</a>
      <a href={contacts.github} data-track="social_github" className="inline-flex items-center gap-2"><SocialIcon platform="github" />GitHub</a>
      <Link href={`/${locale}/resume/${alternate}`} className="inline-flex min-h-11 items-center">{alternate === "founder" ? (locale === "es" ? "Fundador" : "Founder") : (locale === "es" ? "Empleado y consultor" : "Employee & consultant")}</Link>
      <Link href={`/${locale}/agents`}>{locale === "es" ? "Para agentes" : "For agents"}</Link>
      <Link href={`/${locale}/privacy`}>{locale === "es" ? "Privacidad" : "Privacy"}</Link>
    </div>
  </footer>;
}
