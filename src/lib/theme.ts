export type ThemePreference = "device" | "light" | "dark";

export const THEME_STORAGE_KEY = "portfolio_theme";
export const THEME_STYLE_ID = "portfolio-theme";
export const THEME_STYLE = "html:root { color-scheme: light dark; }";
export const THEME_INIT_SCRIPT = `(() => {
  let preference = "device";
  try {
    const stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (stored === "light" || stored === "dark") preference = stored;
  } catch {}
  const rule = document.getElementById(${JSON.stringify(THEME_STYLE_ID)})?.sheet?.cssRules[0];
  if (rule) rule.style.setProperty("color-scheme", preference === "device" ? "light dark" : preference);
})();`;

let preference: ThemePreference | undefined;
const listeners = new Set<() => void>();

function normalizePreference(value: string | null): ThemePreference {
  return value === "light" || value === "dark" ? value : "device";
}

function writeColorScheme(value: ThemePreference) {
  const element = document.getElementById(THEME_STYLE_ID) as HTMLStyleElement | null;
  const rule = element?.sheet?.cssRules[0] as CSSStyleRule | undefined;
  const scheme = value === "device" ? "light dark" : value;
  if (!rule || rule.style.getPropertyValue("color-scheme") === scheme) return;
  rule.style.setProperty("color-scheme", scheme);
}

function applyTheme(value: ThemePreference) {
  writeColorScheme(value);
  preference = value;
  listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent) {
  if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
  try {
    if (event.storageArea !== window.localStorage) return;
  } catch {
    return;
  }
  applyTheme(normalizePreference(event.newValue));
}

export function getThemeSnapshot(): ThemePreference {
  if (preference === undefined) {
    try {
      preference = normalizePreference(window.localStorage.getItem(THEME_STORAGE_KEY));
    } catch {
      preference = "device";
    }
  }
  return preference;
}

export function getThemeServerSnapshot(): ThemePreference {
  return "device";
}

export function syncThemeStyle() {
  writeColorScheme(getThemeSnapshot());
}

export function subscribeToTheme(listener: () => void) {
  if (listeners.size === 0) {
    window.addEventListener("storage", handleStorage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

export function setTheme(value: ThemePreference) {
  applyTheme(value);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, value);
  } catch {
    // The open page keeps its preference when storage is unavailable.
  }
}
