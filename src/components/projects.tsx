import Image from "next/image";
import { Arrow } from "./shell";
import type { Locale } from "@/lib/site";
import { profile } from "@/lib/resume";

function SupervisorVisual({ es }: { es: boolean }) {
  return <div aria-hidden="true" className="supervisor-visual relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[1.55rem] p-6 sm:min-h-[430px] sm:p-12">
    <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
    <div className="supervisor-window relative w-full max-w-[370px] rounded-2xl bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2.5"><Image src="/images/supervisor-logo.svg" width={185} height={40} alt="" className="h-7 w-auto min-w-0 object-contain object-left" /><span className="ml-auto flex shrink-0 items-center gap-1.5 text-[10px] text-accent"><span className="h-1 w-1 rounded-full bg-accent" />{es ? "Conectado" : "Connected"}</span></div>
      <div className="ml-7 mt-7 rounded-2xl rounded-br-sm bg-peach p-3.5 text-xs leading-relaxed">{es ? "¿Qué necesita mi atención hoy?" : "What needs my attention today?"}</div>
      <p className="mt-6 text-xs leading-relaxed text-muted">{es ? "Tus operaciones, en una conversación." : "Your operations, in one conversation."}</p>
      <div className="mt-4 space-y-2">
        {[["01", es ? "Consultar tus datos" : "Ask your data"], ["02", es ? "Supervisar la operación" : "Watch your operations"], ["03", es ? "Programar el trabajo" : "Schedule the work"]].map(([n, label]) => <div key={n} className="flex items-center gap-3 rounded-lg bg-mist px-3 py-3 text-[11px]"><span className="font-mono text-accent">{n}</span>{label}<Arrow className="ml-auto h-3 w-3 text-muted" /></div>)}
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4 text-[10px] text-muted"><span>{es ? "Herramientas conectadas" : "Connected tools"}</span><span>Web · Mobile · Chat</span></div>
    </div>
  </div>;
}

function ConstructorVisual({ es }: { es: boolean }) {
  return <div aria-hidden="true" className="constructor-visual relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[1.55rem] p-6 sm:min-h-[430px] sm:p-10">
    <div className="constructor-window relative w-full max-w-[390px] overflow-hidden rounded-xl bg-white">
      <div className="flex items-center gap-1.5 border-b border-ink/10 px-4 py-3"><span className="h-1.5 w-1.5 rounded-full bg-ink/20" /><span className="h-1.5 w-1.5 rounded-full bg-ink/15" /><span className="h-1.5 w-1.5 rounded-full bg-ink/10" /><span className="ml-auto font-mono text-[9px] text-muted">constructor / preview</span></div>
      <div className="flex items-center justify-between px-5 py-4"><span className="text-[11px] font-semibold tracking-tight">STUDIO FORMA</span><span className="text-[8px] text-muted">{es ? "Trabajo  ·  Estudio" : "Work  ·  Studio"}</span></div>
      <div className="grid grid-cols-[1.1fr_1fr] items-end gap-3 px-5 pb-7 pt-3"><div><p className="text-[8px] uppercase tracking-[.1em] text-muted">{es ? "Diseño con intención" : "Design with intention"}</p><p className="mt-3 text-[30px] font-medium leading-[1.06] tracking-[-.05em]">{es ? <>Una idea.<br />Un nuevo<br />espacio.</> : <>An idea.<br />A new<br />perspective.</>}</p><span className="mt-4 inline-flex rounded-full bg-ink px-3 py-1.5 text-[8px] text-white">{es ? "Ver el trabajo" : "Explore the work"}</span></div><div className="sculpture-scene relative h-40 overflow-hidden rounded-[4px]"><div className="sculpture-arch" /><div className="sculpture-ball" /></div></div>
      <div className="mx-5 mb-5 flex items-center gap-2 border-t border-ink/10 pt-3 text-[8px] text-muted"><span className="h-1 w-1 rounded-full bg-accent" />{es ? "Diseñado. Construido. Publicado." : "Designed. Built. Published."}</div>
    </div>
    <div className="constructor-prompt absolute bottom-6 left-6 right-6 mx-auto flex max-w-[370px] items-center gap-3 rounded-xl bg-ink px-4 py-3.5 text-[10px] text-white sm:bottom-9"><span className="font-mono text-white/40">&gt;</span><span>{es ? "Crea un sitio para mi estudio de diseño" : "Build a website for my design studio"}</span><span className="ml-auto rounded-md bg-white/10 p-1"><Arrow className="h-3 w-3" /></span></div>
  </div>;
}

export function Projects({ locale }: { locale: Locale }) {
  const es = locale === "es";
  const founderRole = profile.work.find((work) => work.id === "supervisor")?.position[locale];
  return <section id="work" className="border-t border-ink/10 py-12 sm:py-16">
    <div className="mb-9"><p className="eyebrow">{es ? "En lo que trabajo ahora" : "What I'm working on now"}</p><h2 className="mt-3 text-3xl font-bold tracking-tight">{es ? "Los productos que estoy construyendo" : "The products I'm building"}</h2></div>
    <div className="grid gap-10 md:grid-cols-[1.08fr_1fr] md:gap-7">
      <article>
        <a href="https://trysupervisor.com" aria-label={es ? "Visitar Supervisor" : "Visit Supervisor"} className="project-shell group block rounded-[2rem] p-2" data-track="project_supervisor"><SupervisorVisual es={es} /></a>
        <div className="px-1 pt-6"><div className="flex items-center justify-between"><h3 className="text-2xl font-bold tracking-tight">Supervisor</h3><a href="https://trysupervisor.com" aria-label={es ? "Abrir Supervisor" : "Open Supervisor"} className="circle-link" data-track="project_supervisor"><Arrow /></a></div><p className="mt-2 text-xs text-accent">{es ? "Producto e ingeniería" : "Product & engineering"}</p><p className="mt-4 max-w-[440px] text-sm leading-[1.8] text-muted">{es ? "Consulta tus datos, detecta lo que necesita atención y programa acciones. La operación de tu empresa, desde las herramientas que tu equipo ya usa." : "Ask your data, catch what needs attention, and schedule actions. Business operations, through the tools your team already uses."}</p><p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted">{founderRole}</p></div>
      </article>
      <article className="md:pt-16">
        <a href="https://useconstructor.com" aria-label={es ? "Visitar Constructor" : "Visit Constructor"} className="project-shell group block rounded-[2rem] p-2" data-track="project_constructor"><ConstructorVisual es={es} /></a>
        <div className="px-1 pt-6"><div className="flex items-center justify-between"><h3 className="text-2xl font-bold tracking-tight">Constructor</h3><a href="https://useconstructor.com" aria-label={es ? "Abrir Constructor" : "Open Constructor"} className="circle-link" data-track="project_constructor"><Arrow /></a></div><p className="mt-2 text-xs text-accent">{es ? "Un producto de Supervisor" : "A product by Supervisor"}</p><p className="mt-4 max-w-[440px] text-sm leading-[1.8] text-muted">{es ? "Describe el producto que necesitas. Constructor lo diseña, escribe el código y lo publica. Software que puedes compartir y seguir mejorando." : "Describe the product you need. Constructor designs it, writes the code, and deploys it. Software you can share and keep improving."}</p><p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted">{founderRole}</p></div>
      </article>
    </div>
  </section>;
}
