import Image from "next/image";
import { Arrow } from "./shell";
import type { Locale } from "@/lib/site";
import { profile } from "@/lib/resume";
import supervisorPreview from "../../public/images/projects/supervisor.webp";
import constructorPreview from "../../public/images/projects/constructor.webp";

const previews = { supervisor: supervisorPreview, constructor: constructorPreview };

export function Projects({ locale }: { locale: Locale }) {
  const es = locale === "es";
  const founderRole = profile.work.find((work) => work.id === "supervisor")?.position[locale];

  return (
    <section id="work" className="border-t border-ink/10 py-12 sm:py-16">
      <div className="mb-9">
        <p className="eyebrow">{es ? "En lo que trabajo ahora" : "What I'm working on now"}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">{es ? "Los productos que estoy construyendo" : "The products I'm building"}</h2>
      </div>
      <div className="grid gap-10 md:grid-cols-[1.08fr_1fr] md:gap-7">
        {profile.projects.map((project) => (
          <article key={project.id} className={project.id === "constructor" ? "md:pt-16" : undefined}>
            <a href={project.url} aria-label={`${es ? "Visitar" : "Visit"} ${project.name}`} className="project-shell group block rounded-[2rem] p-2" data-track={`project_${project.id}`}>
              <div aria-hidden="true" className="relative aspect-[16/11] overflow-hidden rounded-[1.55rem] bg-white">
                <Image src={previews[project.id]} alt="" fill sizes="(min-width: 768px) 600px, calc(100vw - 56px)" className="object-contain object-top" />
                <iframe
                  src={project.url}
                  title={`${project.name} ${es ? "vista previa del sitio" : "website preview"}`}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin"
                  referrerPolicy="no-referrer"
                  tabIndex={-1}
                  className="pointer-events-none absolute left-0 top-0 h-[250%] w-[250%] origin-top-left scale-[.4] border-0"
                />
              </div>
            </a>
            <div className="px-1 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold tracking-tight">{project.name}</h3>
                <a href={project.url} aria-label={`${es ? "Abrir" : "Open"} ${project.name}`} className="circle-link" data-track={`project_${project.id}`}><Arrow /></a>
              </div>
              <p className="mt-2 text-xs text-accent">
                {project.id === "supervisor" ? (es ? "Producto e ingeniería" : "Product & engineering") : (es ? "Un producto de Supervisor" : "A product by Supervisor")}
              </p>
              <p className="mt-4 max-w-[440px] text-sm leading-[1.8] text-muted">{project.description[locale]}</p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted">{founderRole}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
