import type { ReactNode } from "react";
import type { Resume } from "@/lib/resume";

export function ResumeSummary({ resume }: { resume: Resume }) {
  const summary = resume.basics.summary;
  const projectsByName = new Map(resume.projects.map((project) => [project.name, project]));
  const content: ReactNode[] = [];
  let start = 0;

  for (const match of summary.matchAll(/\b(?:Supervisor|Constructor)\b/g)) {
    const project = projectsByName.get(match[0]);
    if (!project?.url) continue;

    content.push(summary.slice(start, match.index));
    content.push(
      <a
        key={`${project.name}:${match.index}`}
        href={project.url}
        className="font-medium text-accent underline decoration-accent/60 underline-offset-4 hover:text-ink"
        data-track={`project_${project.name.toLowerCase()}`}
      >
        {project.name}
      </a>,
    );
    start = match.index + match[0].length;
  }
  content.push(summary.slice(start));

  return <p className="mt-3 max-w-[650px] text-base leading-[1.8] text-muted sm:text-lg"><span>{resume.basics.label}</span>. {content}</p>;
}
