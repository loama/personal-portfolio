"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentProps } from "react";
import { resumePath, type Locale, type ResumeVersion } from "@/lib/site";
import { storyCopy } from "@/lib/story-copy";

type ChapterLink = { id: string; label: string };
const noChapters: ChapterLink[] = [];

export function StoryPageLink(props: Omit<ComponentProps<typeof Link>, "onNavigate" | "scroll">) {
  return <Link {...props} scroll={false} onNavigate={() => window.scrollTo({ top: 0, behavior: "instant" })} />;
}

export function StoryNavigation({ locale, chapters = noChapters, path = "/v2", version = "founder" }: {
  locale: Locale; chapters?: ChapterLink[]; path?: string; version?: ResumeVersion;
}) {
  const [active, setActive] = useState(0);
  const copy = storyCopy[locale];

  useEffect(() => {
    if (!chapters.length) return;
    const sections = chapters.flatMap(({ id }) => {
      const element = document.getElementById(id);
      return element ? [element] : [];
    });
    let frame = 0;
    function updateActiveChapter() {
      frame = 0;
      const line = innerHeight * 0.4;
      const footer = sections.at(-1)?.getBoundingClientRect();
      const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 4
        || Boolean(footer && footer.top < innerHeight && footer.bottom <= innerHeight + 4);
      const index = atEnd ? sections.length - 1 : sections.findIndex((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= line && rect.bottom > line;
      });
      if (index >= 0) setActive(index);
    }
    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(updateActiveChapter);
    }
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    const entered = new WeakSet<Element>();
    const reveal = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entered.has(entry.target)) continue;
        entered.add(entry.target);
        if (!motion.matches) animations.push(entry.target.animate([
          { opacity: 0, transform: "translateY(24px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 750, easing: "cubic-bezier(.2,.65,.3,1)" }));
      }
    }, { threshold: 0.12 });
    sections.slice(1, -1).forEach((section) => reveal.observe(section));
    const stopMotion = () => { if (motion.matches) animations.forEach((animation) => animation.cancel()); };
    motion.addEventListener("change", stopMotion);
    return () => {
      reveal.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      animations.forEach((animation) => animation.cancel());
      motion.removeEventListener("change", stopMotion);
    };
  }, [chapters]);

  return <>
    <header className={`story-nav${chapters.length ? " story-reader" : ""}`}>
      <StoryPageLink prefetch={false} href={`/${locale}/v2`} className="story-wordmark">Eduardo Lopez</StoryPageLink>
      {chapters.length > 0 ? <p className="story-count" aria-label={`${active + 1} / ${chapters.length}: ${chapters[active]?.label}`}>
        <b>{String(active + 1).padStart(2, "0")}</b> / {String(chapters.length).padStart(2, "0")}<span> · {chapters[active]?.label}</span>
      </p> : <span className="story-count">CV</span>}
      <div className="story-nav-right">
        <nav className="story-languages" aria-label={copy.language}>
          {(["en", "es"] as const).map((lang) => <Link key={lang} prefetch={false} href={`/${lang}${path}`} scroll={false} lang={lang} hrefLang={lang} aria-current={lang === locale ? "page" : undefined}>{lang.toUpperCase()}</Link>)}
        </nav>
        <StoryPageLink prefetch={false} href={`/${locale}/v2/resume/${version}`} aria-current={path.includes("/resume/") ? "page" : undefined}>CV</StoryPageLink>
        <a className="story-button" href={resumePath(locale, version, "pdf")} download data-track="download_pdf">PDF</a>
      </div>
    </header>
    {chapters.length > 0 && <nav className="story-rail" aria-label={copy.chapters}>
      {chapters.map(({ id, label }, index) => <a key={id} href={`#${id}`} aria-label={label} aria-current={index === active ? "location" : undefined}>
        <span>{String(index + 1).padStart(2, "0")} {label}</span>
      </a>)}
    </nav>}
  </>;
}
