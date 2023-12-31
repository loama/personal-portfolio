import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'

import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Container } from '@/components/Container'
import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
  WhatsappIcon,
} from '@/components/SocialIcons'
import logoAmiloz from '@/images/logos/amiloz.jpeg'
import logoBetterfin from '@/images/logos/betterfin.jpeg'
import logoZeel from '@/images/logos/zeel.jpeg'
import logoEiya from '@/images/logos/eiya.jpeg'
import logoRappi from '@/images/logos/rappi.jpeg'
import logoPlanetaria from '@/images/logos/planetaria.svg'
import { formatDate } from '@/lib/formatDate'
import { generateRssFeed } from '@/lib/generateRssFeed'
import { getAllArticles } from '@/lib/getAllArticles'

function BriefcaseIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M2.75 9.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"
        className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
      />
      <path
        d="M3 14.25h6.249c.484 0 .952-.002 1.316.319l.777.682a.996.996 0 0 0 1.316 0l.777-.682c.364-.32.832-.319 1.316-.319H21M8.75 6.5V4.75a2 2 0 0 1 2-2h2.5a2 2 0 0 1 2 2V6.5"
        className="stroke-zinc-400 dark:stroke-zinc-500"
      />
    </svg>
  )
}

function ArrowDownIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.75 8.75 8 12.25m0 0 3.25-3.5M8 12.25v-8.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Article({ article }) {
  return (
    <Card as="article">
      <Card.Title href={`/projects/${article.slug}`}>
        {article.title}
      </Card.Title>
      <Card.Eyebrow as="time" dateTime={article.date} decorate>
        {formatDate(article.date)}
      </Card.Eyebrow>
      <Card.Description>{article.description}</Card.Description>
      <Card.Cta>Read article</Card.Cta>
    </Card>
  )
}

function SocialLink({ icon: Icon, ...props }) {
  return (
    <Link className="group -m-1 p-1" {...props}>
      <Icon className="fill-zinc-500 group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300 h-6 transition w-6" />
    </Link>
  )
}

function Resume() {
  let resume = [
    {
      company: 'Startup Software Consultant',
      title: '-',
      logo: logoPlanetaria,
      start: '2018',
      end: {
        label: 'Present',
        dateTime: new Date().getFullYear(),
      },
    },
    {
      company: 'amiloz (YC w22)',
      title: 'cofounder / CTO',
      logo: logoAmiloz,
      start: '2021',
      end: '2022',
    },
    {
      company: 'Betterfin (acq)',
      title: 'Software Engineer',
      logo: logoBetterfin,
      start: '2019',
      end: '2021',
    },
    {
      company: 'Zeel',
      title: 'Full Stack Developer',
      logo: logoZeel,
      start: '2018',
      end: '2019',
    },
    {
      company: 'eiya',
      title: 'Lead Engineer',
      logo: logoEiya,
      start: '2016',
      end: '2018',
    },
    {
      company: 'Rappi',
      title: 'First in-house engineer',
      logo: logoRappi,
      start: '2015',
      end: '2016',
    },
  ]

  return (
    <div className="border-zinc-100 dark:border-zinc-700/40 border p-6 rounded-2xl">
      <h2 className="text-zinc-900 dark:text-zinc-100 flex font-semibold text-sm">
        <BriefcaseIcon className="flex-none h-6 w-6" />
        <span className="ml-3">Work</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {resume.map((role, roleIndex) => (
          <li key={roleIndex} className="flex gap-4">
            <div className="shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 flex flex-none h-10 items-center justify-center mt-1 relative rounded-full shadow-md w-10">
              <Image src={role.logo} alt="" className="h-8 rounded-full w-8" unoptimized />
            </div>
            <dl className="gap-x-2 flex flex-auto flex-wrap">
              <dt className="sr-only">Company</dt>
              <dd className="text-zinc-900 dark:text-zinc-100 flex-none font-medium text-sm w-full">
                {role.company}
              </dd>
              <dt className="sr-only">Role</dt>
              <dd className="text-zinc-500 dark:text-zinc-400 text-xs">
                {role.title}
              </dd>
              <dt className="sr-only">Date</dt>
              <dd
                className="text-zinc-400 dark:text-zinc-500 ml-auto text-xs"
                aria-label={`${role.start.label ?? role.start} until ${
                  role.end.label ?? role.end
                }`}
              >
                <time dateTime={role.start.dateTime ?? role.start}>
                  {role.start.label ?? role.start}
                </time>{' '}
                <span aria-hidden="true">—</span>{' '}
                <time dateTime={role.end.dateTime ?? role.end}>
                  {role.end.label ?? role.end}
                </time>
              </dd>
            </dl>
          </li>
        ))}
      </ol>
      <Button href="#" variant="secondary" className="group mt-6 w-full">
        Download CV
        <ArrowDownIcon className="stroke-zinc-400 group-active:stroke-zinc-600 dark:group-hover:stroke-zinc-50 dark:group-active:stroke-zinc-50 h-4 transition w-4" />
      </Button>
    </div>
  )
}

export default function Home({ articles }) {
  return (
    <>
      <Head>
        <title>
          Eduardo López, software developer, founder, and amateur astronaut
        </title>
        <meta
          name="description"
          content="I'm Eduardo, have been building software for the last 10 years, mainly for startups.
          I cofounded amiloz (YC w22) for which we raised a few million dollars, later on we had to pivot and I got a micro exit from that."
        />
      </Head>
      <Container className="mt-9">
        <div className="max-w-2xl">
          <h1 className="text-zinc-800 dark:text-zinc-100 sm:text-5xl font-semibold text-4xl tracking-tight">
            Software developer, founder and designer.
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-6 text-base">
            I&apos;m Eduardo, have been building software for the last 10 years, mainly for startups.
            I cofounded amiloz (YC w22) for which we raised a few million dollars, later on we had to pivot and I got a micro exit from that.
            <br />Now I am onto my next thing and meanwhile I help other startups build their products.
          </p>
          <div className="flex gap-6 mt-6">
            <SocialLink
              href="https://twitter.com/loama18"
              aria-label="Follow on Twitter"
              icon={TwitterIcon}
              target="_blank"
            />
            <SocialLink
              href="https://twitter.com/loama18"
              aria-label="Follow on Instagram"
              icon={InstagramIcon}
              target="_blank"
            />
            <SocialLink
              href="https://github.com/loama"
              aria-label="Follow on GitHub"
              icon={GitHubIcon}
              target="_blank"
            />
            <SocialLink
              href="https://www.linkedin.com/in/eduardolopezamaya/"
              aria-label="Follow on LinkedIn"
              icon={LinkedInIcon}
              target="_blank"
            />
            <SocialLink
              href="https://api.whatsapp.com/send?phone=16468757265&text=Hey%20Eduardo!%20I%20was%20on%20your%20personal%20portfolio%20and%20would%20love%20to%20chat"
              aria-label="Text me on whatsapp"
              icon={WhatsappIcon}
              target="_blank"
            />
          </div>
        </div>
      </Container>
      
      <Container className="md:mt-28 mt-24">
        <div className="gap-y-20 lg:max-w-none lg:grid-cols-2 grid grid-cols-1 max-w-xl mx-auto">
          <div className="flex flex-col gap-16">
            {articles.map((article) => (
              <Article key={article.slug} article={article} />
            ))}
          </div>
          <div className="lg:pl-16 xl:pl-24 space-y-10">
            <Resume />
          </div>
        </div>
      </Container>
    </>
  )
}

export async function getStaticProps() {
  if (process.env.NODE_ENV === 'production') {
    await generateRssFeed()
  }

  return {
    props: {
      articles: (await getAllArticles())
        .slice(0, 4)
        .map(({ component, ...meta }) => meta),
    },
  }
}
