import Link from "next/link";
import type { Locale, ResumeVersion } from "@/lib/site";

export function MainNavigation({ locale, path, mode }: { locale: Locale; path: string; mode: ResumeVersion }) {
  const es = locale === "es";
  const isResume = path.startsWith("/resume/");
  const isWork = path === "" || path === "/work" || path.startsWith("/work/");

  return <nav aria-label={es ? "Navegación principal" : "Main navigation"} className="nav-island order-3 flex w-full items-center justify-center gap-0.5 rounded-full px-1 py-1 text-xs font-medium sm:order-none sm:w-auto sm:gap-1 sm:px-1.5 sm:text-[13px]">
    <Link href={`/${locale}#work`} aria-current={isWork ? "location" : undefined}>{es ? "Proyectos" : "Projects"}</Link>
    <Link href={`/${locale}/resume/${mode}`} aria-current={isResume ? "page" : undefined}>{es ? "Currículum" : "Resume"}</Link>
  </nav>;
}
