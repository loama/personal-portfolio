import Link from "next/link";
import type { Locale, ResumeVersion } from "@/lib/site";

export function ResumeNavigation({ locale, path, mode }: { locale: Locale; path: string; mode: ResumeVersion }) {
  const es = locale === "es";
  const isResume = path.startsWith("/resume/");

  return <nav aria-label={es ? "Versión del currículum" : "Resume version"} data-selected={isResume ? mode : undefined} className="nav-island relative isolate col-start-1 row-start-2 grid w-full grid-cols-2 rounded-xl p-1 text-xs font-medium sm:max-w-[340px] lg:col-start-2 lg:row-start-1 lg:min-w-[300px] lg:text-[13px]">
    <Link href={`/${locale}/resume/founder`} data-segment="founder" aria-current={isResume && mode === "founder" ? "page" : undefined}>{es ? "Fundador" : "Founder"}</Link>
    <Link href={`/${locale}/resume/employee`} data-segment="employee" aria-label={es ? "Empleado y consultor" : "Employee & consultant"} aria-current={isResume && mode === "employee" ? "page" : undefined}><span>{es ? "Empleado" : "Employee"}<span className="hidden sm:inline">{es ? " y consultor" : " & consultant"}</span></span></Link>
  </nav>;
}
