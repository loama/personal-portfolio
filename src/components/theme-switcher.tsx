"use client";

import { useId, useLayoutEffect, useSyncExternalStore } from "react";
import { DesktopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import type { Locale } from "@/lib/site";
import { getThemeSnapshot, getThemeServerSnapshot, setTheme, subscribeToTheme, syncThemeStyle } from "@/lib/theme";

const options = [
  { value: "device", Icon: DesktopIcon, en: "Device", es: "Dispositivo" },
  { value: "light", Icon: SunIcon, en: "Light", es: "Claro" },
  { value: "dark", Icon: MoonIcon, en: "Dark", es: "Oscuro" },
] as const;

export function ThemeSwitcher({ locale, className = "" }: { locale: Locale; className?: string }) {
  const name = useId();
  const preference = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getThemeServerSnapshot);

  useLayoutEffect(() => {
    // Locale navigation replaces the head stylesheet. Restore its scheme before paint.
    syncThemeStyle();
  }, [locale]);

  return (
    <fieldset className={`inline-flex min-w-0 items-center rounded-full bg-mist p-1 ${className}`}>
      <legend className="sr-only">{locale === "es" ? "Apariencia" : "Appearance"}</legend>
      {options.map(({ value, Icon, ...labels }) => (
        <label key={value} title={labels[locale]} className="relative cursor-pointer">
          <input
            type="radio"
            name={name}
            value={value}
            checked={preference === value}
            onChange={() => setTheme(value)}
            aria-label={labels[locale]}
            className="peer sr-only"
          />
          <span className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-ink peer-checked:bg-surface peer-checked:text-ink peer-checked:shadow-sm peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink sm:h-10 sm:w-10">
            <Icon aria-hidden="true" className="h-4 w-4" />
          </span>
        </label>
      ))}
    </fieldset>
  );
}
