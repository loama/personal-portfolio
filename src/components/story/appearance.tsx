"use client";

import { useEffect, useSyncExternalStore } from "react";
import { DesktopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { getStoryTheme, getStoryThemeServer, setStoryTheme, STORY_THEME_SCRIPT, STORY_THEME_STYLE, STORY_THEME_STYLE_ID, subscribeStoryTheme, syncStoryTheme } from "@/lib/story-theme";
import type { Locale } from "@/lib/site";

const subscribe = () => () => {};
const clientSnapshot = () => false;
const serverSnapshot = () => true;

export function StoryThemeInit() {
  const server = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return <>
    <style id={STORY_THEME_STYLE_ID}>{STORY_THEME_STYLE}</style>
    {server && <script dangerouslySetInnerHTML={{ __html: STORY_THEME_SCRIPT }} />}
  </>;
}

export function StoryAppearance({ locale }: { locale: Locale }) {
  const preference = useSyncExternalStore(subscribeStoryTheme, getStoryTheme, getStoryThemeServer);
  useEffect(syncStoryTheme, []);
  const es = locale === "es";
  const options = [
    { value: "device", label: es ? "Dispositivo" : "Device", Icon: DesktopIcon },
    { value: "light", label: es ? "Claro" : "Light", Icon: SunIcon },
    { value: "dark", label: es ? "Oscuro" : "Dark", Icon: MoonIcon },
  ] as const;
  return <fieldset className="story-appearance">
    <legend className="sr-only">{es ? "Apariencia" : "Appearance"}</legend>
    {options.map(({ value, label, Icon }) => <label key={value}>
      <input type="radio" name="story-appearance" value={value} checked={value === preference} onChange={() => setStoryTheme(value)} />
      <span><Icon aria-hidden="true" /><span>{label}</span></span>
    </label>)}
  </fieldset>;
}
