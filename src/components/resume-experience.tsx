import { ChevronDownIcon } from "@radix-ui/react-icons";
import { CompanyLogo } from "./company-logo";
import { profile, type Resume } from "@/lib/resume";
import type { Locale } from "@/lib/site";

export function ResumeExperience({ work, locale }: { work: Resume["work"]; locale: Locale }) {
  const es = locale === "es";

  return (
    <div className="mt-5">
      {work.map((entry) => {
        const source = profile.work.find((item) => item.name === entry.name || item.nameEs === entry.name);
        const publicWork = profile.publicWork.filter((item) => item.project === source?.id);

        return (
          <article key={`${entry.name}-${entry.position}`} id={source ? `experience-${source.id}` : undefined} className="border-t border-ink/10 py-6">
            <div className="flex items-start gap-3.5">
              <CompanyLogo company={entry.name} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-base font-semibold">{entry.name}</h3>
                  <p className="text-xs text-muted">
                    {entry.startDate?.replace("-", "/")}
                    {entry.startDate ? (es ? " a " : " to ") : (entry.endDate ? (es ? "Hasta " : "Through ") : "")}
                    {entry.endDate?.replace("-", "/") ?? (es ? "Actualidad" : "Present")}
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted">{entry.position}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{entry.summary}</p>
            {entry.highlights.length > 0 && (
              <ul className="mt-3 space-y-2 pl-4 text-sm leading-relaxed text-muted">
                {entry.highlights.map((item) => <li key={item} className="list-disc pl-1 marker:text-accent/50">{item}</li>)}
              </ul>
            )}
            {(entry.details.length > 0 || publicWork.length > 0) && (
              <details className="group mt-3">
                <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-md text-sm font-medium text-accent transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
                  {es ? "Más sobre este trabajo" : "More about this work"}
                  <span className="sr-only">{` ${es ? "en" : "at"} ${entry.name}`}</span>
                  <ChevronDownIcon aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="mb-1 mt-3 space-y-6 border-l-2 border-brand/25 pl-5">
                  {entry.details.map((detail) => <section key={detail.title}>
                    <h4 className="text-sm font-semibold text-ink">{detail.title}</h4>
                    {detail.paragraphs.map((paragraph) => <p key={paragraph} className="mt-2 text-sm leading-[1.8] text-muted">{paragraph}</p>)}
                  </section>)}
                  {publicWork.length > 0 && <section>
                    <h4 className="text-sm font-semibold text-ink">{es ? "Trabajo público seleccionado" : "Selected public work"}</h4>
                    <ul className="mt-3 space-y-4">
                      {publicWork.map((item) => <li key={item.url}>
                        <a href={item.url} className="inline-block text-sm font-medium text-accent underline underline-offset-4">{item.title[locale]}</a>
                        <p className="mt-2 text-sm leading-[1.8] text-muted">{item.body[locale]}</p>
                      </li>)}
                    </ul>
                  </section>}
                </div>
              </details>
            )}
          </article>
        );
      })}
    </div>
  );
}
