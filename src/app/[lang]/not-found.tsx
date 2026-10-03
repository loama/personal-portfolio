import Link from "next/link";

export default function NotFound() {
  return <main id="main" className="mx-auto max-w-2xl px-6 py-32"><span className="eyebrow">404</span><h1 lang="en" className="mt-5 text-4xl font-bold tracking-tight">This page is not here.</h1><p lang="es" className="mt-5 text-muted">Esta página no existe.</p><div className="mt-8 flex gap-5"><Link lang="en" href="/en" className="button-primary">Home</Link><Link lang="es" href="/es" className="button-primary">Inicio</Link></div></main>;
}
