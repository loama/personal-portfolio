import Link from 'next/link'

import { Container } from '@/components/Container'

function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="hover:text-teal-500 dark:hover:text-teal-400 transition"
    >
      {children}
    </Link>
  )
}

export function Footer() {
  return (
    <footer className="mt-32">
      <Container.Outer>
        <div className="border-zinc-100 dark:border-zinc-700/40 border-t pb-16 pt-10">
          <Container.Inner>
            <div className="sm:flex-row flex flex-col gap-6 items-center justify-between">
              <div className="gap-x-6 gap-y-1 text-zinc-800 dark:text-zinc-200 flex flex-wrap font-medium justify-center text-sm">
                <NavLink href="/about">About</NavLink>
                <NavLink href="/projects">Projects</NavLink>
                <NavLink href="/speaking">Speaking</NavLink>
                <NavLink href="/uses">Uses</NavLink>
              </div>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm">
                &copy; {new Date().getFullYear()} Eduardo López. All rights
                reserved.
              </p>
            </div>
          </Container.Inner>
        </div>
      </Container.Outer>
    </footer>
  )
}
