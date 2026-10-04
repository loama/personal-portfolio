import Link from "next/link";
import type { Resume } from "@/lib/resume";
import { contacts, REPOSITORY_URL, type Locale } from "@/lib/site";
import { Arrow } from "./shell";
import { SocialIcon } from "./social-icon";

export function ResumeSidebar({ resume, locale }: { resume: Resume; locale: Locale }) {
  const es = locale === "es";

  return <aside className="space-y-10">
    <section>
      <h2 className="text-sm font-semibold">{es ? "Herramientas" : "Tools"}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {resume.skills.flatMap((skill) => skill.keywords).map((skill) => <span key={skill} className="rounded-lg bg-mist px-2.5 py-1.5 text-xs text-muted">{skill}</span>)}
      </div>
    </section>
    <section>
      <h2 className="text-sm font-semibold">{es ? "Formación" : "Background"}</h2>
      {resume.education.map((item) => <div key={item.institution} className="mt-4">
        <p className="text-sm font-medium">{item.institution}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{item.area}</p>
      </div>)}
    </section>
    <section>
      <h2 className="text-sm font-semibold">{es ? "Idiomas" : "Languages"}</h2>
      <p className="mt-3 text-sm text-muted">{es ? "Español e inglés" : "Spanish and English"}</p>
    </section>
    <section id="contact">
      <h2 className="text-sm font-semibold">{es ? "Conectar" : "Connect"}</h2>
      <div className="mt-3 flex flex-col items-start text-sm text-muted">
        <a href={contacts.whatsapp} data-track="contact_whatsapp" className="flex min-h-11 items-center gap-3 transition-colors hover:text-ink"><SocialIcon platform="whatsapp" />WhatsApp</a>
        <a href={`mailto:${contacts.email}`} data-track="contact_email" className="flex min-h-11 max-w-full items-center gap-3 transition-colors hover:text-ink"><SocialIcon platform="email" /><span className="break-all">{contacts.email}</span></a>
        <a href={contacts.linkedin} data-track="social_linkedin" className="flex min-h-11 items-center gap-3 transition-colors hover:text-ink"><SocialIcon platform="linkedin" />LinkedIn</a>
        <a href={contacts.x} data-track="social_x" className="flex min-h-11 items-center gap-3 transition-colors hover:text-ink"><SocialIcon platform="x" />X</a>
      </div>
    </section>
    <div className="flex flex-col items-start gap-2">
      <Link href={`/${locale}/agents`} className="inline-flex min-h-11 items-center gap-2 text-xs text-accent">{es ? "También disponible por API y MCP" : "Also available through API & MCP"}<Arrow /></Link>
      <a href={REPOSITORY_URL} data-track="view_source" className="inline-flex min-h-11 items-center gap-2 text-xs text-muted underline decoration-ink/30 underline-offset-4 transition-colors hover:text-ink"><SocialIcon platform="github" />{es ? "Código fuente en GitHub" : "Source code on GitHub"}<Arrow /></a>
    </div>
  </aside>;
}
