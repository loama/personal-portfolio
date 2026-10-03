import Image from "next/image";
import { getCompanyLogo } from "@/lib/company-logos";
import type { Resume } from "@/lib/resume";
import type { Locale } from "@/lib/site";

export function ResumeExperience({ work, locale }: { work: Resume["work"]; locale: Locale }) {
  const es = locale === "es";

  return (
    <div className="mt-5">
      {work.map((entry) => {
        const logo = getCompanyLogo(entry.name);

        return (
          <article key={`${entry.name}-${entry.position}`} className="border-t border-ink/10 py-6">
            <div className="flex items-start gap-3.5">
              {logo && (
                <Image
                  src={logo}
                  alt=""
                  width={44}
                  height={44}
                  sizes="44px"
                  className="h-11 w-11 shrink-0 bg-white object-contain"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-base font-semibold">{entry.name}</h3>
                  <p className="text-xs text-muted">
                    {entry.startDate?.replace("-", "/")}
                    {entry.startDate ? (es ? " a " : " to ") : (entry.endDate ? (es ? "Hasta " : "Through ") : "")}
                    {entry.endDate?.replace("-", "/") ?? (es ? "Actualidad" : "Present")}
                  </p>
                </div>
                <p className="mt-1 text-sm text-accent">{entry.position}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{entry.summary}</p>
            {entry.highlights.length > 0 && (
              <ul className="mt-3 space-y-2 pl-4 text-sm leading-relaxed text-muted">
                {entry.highlights.map((item) => <li key={item} className="list-disc pl-1 marker:text-accent/50">{item}</li>)}
              </ul>
            )}
          </article>
        );
      })}
    </div>
  );
}
