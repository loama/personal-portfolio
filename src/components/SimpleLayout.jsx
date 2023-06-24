import { Container } from '@/components/Container'

export function SimpleLayout({ title, intro, children }) {
  return (
    <Container className="sm:mt-32 mt-16">
      <header className="max-w-2xl">
        <h1 className="text-zinc-800 dark:text-zinc-100 sm:text-5xl font-semibold text-4xl tracking-tight">
          {title}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-6 text-base">
          {intro}
        </p>
      </header>
      <div className="sm:mt-20 mt-16">{children}</div>
    </Container>
  )
}
