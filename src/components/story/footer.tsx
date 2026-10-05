import { contacts, REPOSITORY_URL, resumePath, type Locale, type ResumeVersion } from "@/lib/site";
import { storyCopy } from "@/lib/story-copy";
import { SocialIcon } from "../social-icon";
import { StoryAppearance } from "./appearance";
import { StoryPageLink } from "./navigation";

export function StorySocials() {
  return <div className="story-socials">
    <a href={contacts.github} data-track="social_github"><SocialIcon platform="github" />GitHub</a>
    <a href={contacts.x} data-track="social_x"><SocialIcon platform="x" />X</a>
    <a href={contacts.linkedin} data-track="social_linkedin"><SocialIcon platform="linkedin" />LinkedIn</a>
    <a href={contacts.whatsapp} data-track="contact_whatsapp"><SocialIcon platform="whatsapp" />WhatsApp</a>
  </div>;
}

export function StoryFooter({ locale, version = "founder" }: { locale: Locale; version?: ResumeVersion }) {
  const copy = storyCopy[locale];
  return <footer className="story-footer" id="say-hi">
    <div className="story-footer-top">
      <div>
        <p className="story-eyebrow">{copy.contact}</p>
        <a href={`mailto:${contacts.email}`} data-track="contact_email" className="story-email">{contacts.email}</a>
        <StorySocials />
        <p className="story-footer-language">{locale === "es" ? "Inglés · Español" : "English · Spanish"}</p>
      </div>
      <div className="story-footer-resources">
        <StoryPageLink prefetch={false} href={`/${locale}/v2/resume/${version}`}>{copy.resume}</StoryPageLink>
        <a href={resumePath(locale, version, "json")} download data-track="download_json">JSON</a>
        <StoryPageLink prefetch={false} href={`/${locale}/agents`}>{copy.agents}</StoryPageLink>
        <a href={REPOSITORY_URL} data-track="social_github">{copy.source}</a>
      </div>
    </div>
    <div className="story-footer-bottom">
      <p>© 2026 Eduardo López</p>
      <StoryAppearance locale={locale} />
      <div><StoryPageLink prefetch={false} href={`/${locale}/resume/${version}`}>{copy.original}</StoryPageLink><StoryPageLink prefetch={false} href={`/${locale}/privacy`}>{copy.privacy}</StoryPageLink></div>
    </div>
  </footer>;
}
