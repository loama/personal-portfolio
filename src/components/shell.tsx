import Link from "next/link";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { contacts, type Locale } from "@/lib/site";
import { MainNavigation } from "./main-navigation";

export function Arrow({ className = "" }: { className?: string }) {
  return <ArrowTopRightIcon aria-hidden="true" className={`h-4 w-4 ${className}`} />;
}

export function Header({ locale, path = "", mode = "founder" }: { locale: Locale; path?: string; mode?: "founder" | "employee" }) {
  const es = locale === "es";
  return (
    <header className="relative z-20 mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-5 pb-5 pt-7 sm:px-10">
      <Link href={`/${locale}`} className="wordmark inline-flex min-h-11 flex-col items-start justify-center gap-0.5" aria-label={es ? "Eduardo López, inicio" : "Eduardo López, home"}>
        <span className="font-display text-lg font-semibold leading-5 tracking-tight">eduardo lopez<span className="text-brand">.</span></span>
        <span className="text-xs leading-4 text-muted">{es ? "edu para los amigos" : "edu for friends"}</span>
      </Link>
      <MainNavigation locale={locale} path={path} mode={mode} />
      <nav aria-label={es ? "Idioma" : "Language"} className="flex items-center gap-1 text-xs font-semibold">
        {(["en", "es"] as const).map((lang) => <Link key={lang} href={`/${lang}${path}`} scroll={false} hrefLang={lang} lang={lang} aria-current={lang === locale ? "page" : undefined} className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 py-2 transition-colors ${lang === locale ? "bg-ink text-paper" : "text-muted hover:bg-mist"}`}>{lang.toUpperCase()}</Link>)}
      </nav>
    </header>
  );
}

export function AudienceSwitch({ locale, active }: { locale: Locale; active: "founder" | "employee" }) {
  const es = locale === "es";
  return <nav aria-label={es ? "Tipo de perfil" : "Profile focus"} className="inline-flex max-w-full items-center gap-1 rounded-full bg-mist p-1 text-xs font-medium">
    <Link href={`/${locale}`} aria-current={active === "founder" ? "page" : undefined} className={`rounded-full px-4 py-2.5 transition-colors ${active === "founder" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{es ? "Como fundador" : "As a founder"}</Link>
    <Link href={`/${locale}/work`} aria-current={active === "employee" ? "page" : undefined} className={`rounded-full px-4 py-2.5 transition-colors ${active === "employee" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{es ? "Para tu equipo" : "For your team"}</Link>
  </nav>;
}

export function Contact({ locale }: { locale: Locale }) {
  const es = locale === "es";
  return <section id="contact" className="contact-panel relative mx-auto mt-12 max-w-[1240px] overflow-hidden rounded-[2rem] px-7 py-14 sm:px-14 sm:py-20">
    <div className="contact-grid pointer-events-none absolute inset-0" aria-hidden="true" />
    <div className="relative grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-end">
      <div><span className="eyebrow">{es ? "La próxima conversación" : "The next conversation"}</span><h2 className="mt-5 max-w-xl text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold leading-[1.06] tracking-[-0.055em]">{es ? "¿Qué quieres construir?" : "What do you want to build?"}</h2><p className="mt-5 max-w-sm text-base leading-relaxed text-muted">{es ? "Un producto, una empresa o una mejor forma de trabajar. Me interesa escucharlo." : "A product, a company, or a better way to work. I'd like to hear about it."}</p></div>
      <div className="flex flex-col items-start gap-5 md:items-end">
        <a href={contacts.whatsapp} className="button-primary group" data-track="contact_whatsapp">{es ? "Hablemos por WhatsApp" : "Let's talk on WhatsApp"}<span className="button-icon"><Arrow /></span></a>
        <a href={`mailto:${contacts.email}`} className="flex items-center gap-3 text-sm underline decoration-ink/25 underline-offset-4 hover:decoration-ink" data-track="contact_email">{contacts.email}<Arrow /></a>
      </div>
    </div>
  </section>;
}

export function Footer({ locale }: { locale: Locale }) {
  return <footer className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-7 px-5 py-10 text-xs text-muted sm:px-10">
    <p>© 2026 Eduardo López</p>
    <div className="flex flex-wrap gap-x-6 gap-y-4">
      <a href={contacts.linkedin} data-track="social_linkedin">LinkedIn</a>
      <a href={contacts.x} data-track="social_x">X</a>
      <a href={contacts.github} data-track="social_github">GitHub</a>
      <Link href={`/${locale}/agents`}>{locale === "es" ? "Para agentes" : "For agents"}</Link>
      <Link href={`/${locale}/privacy`}>{locale === "es" ? "Privacidad" : "Privacy"}</Link>
    </div>
  </footer>;
}
