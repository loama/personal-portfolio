import type { ThemePreference } from "./theme";

const STORAGE_KEY = "portfolio_story_theme";
const CHANGE_EVENT = "portfolio:story-theme";
let preference: ThemePreference | undefined;
export const STORY_THEME_STYLE_ID = "portfolio-story-theme";
export const STORY_THEME_STYLE = "body:has(.story-site) { color-scheme: dark; }";
export const STORY_THEME_SCRIPT = `(() => {
  let preference = "dark";
  try {
    const value = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    if (["light", "dark", "device"].includes(value)) preference = value;
  } catch {}
  const rule = document.getElementById(${JSON.stringify(STORY_THEME_STYLE_ID)})?.sheet?.cssRules[0];
  if (rule) rule.style.setProperty("color-scheme", preference === "device" ? "light dark" : preference);
})();`;

function readSavedTheme(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    preference = stored === "light" || stored === "device" ? stored : "dark";
  } catch {}
  return preference ??= "dark";
}

export function getStoryTheme(): ThemePreference {
  return preference ?? readSavedTheme();
}

export function getStoryThemeServer(): ThemePreference { return "dark"; }

export function syncStoryTheme() {
  const value = getStoryTheme();
  const sheet = (document.getElementById(STORY_THEME_STYLE_ID) as HTMLStyleElement | null)?.sheet;
  const rule = sheet?.cssRules[0] as CSSStyleRule | undefined;
  rule?.style.setProperty("color-scheme", value === "device" ? "light dark" : value);
}

export function subscribeStoryTheme(callback: () => void) {
  function sync() { syncStoryTheme(); callback(); }
  function storage(event: StorageEvent) {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    try { if (event.storageArea !== window.localStorage) return; } catch { return; }
    preference = event.newValue === "light" || event.newValue === "device" ? event.newValue : "dark";
    sync();
  }
  window.addEventListener("storage", storage);
  window.addEventListener(CHANGE_EVENT, sync);
  readSavedTheme();
  sync();
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener(CHANGE_EVENT, sync);
  };
}

export function setStoryTheme(value: ThemePreference) {
  preference = value;
  try { window.localStorage.setItem(STORAGE_KEY, value); } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
