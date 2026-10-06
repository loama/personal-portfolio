import localFont from "next/font/local";
import { StoryThemeInit } from "@/components/story/appearance";
import "./story.css";

const dmSans = localFont({ src: "../../../../public/fonts/DM-Sans-Latin.woff2", variable: "--font-story", display: "swap", weight: "400 600" });

export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return <>
    <StoryThemeInit />
    <div className={`${dmSans.variable} story-site`}>{children}</div>
  </>;
}
