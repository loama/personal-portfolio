"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { isAnalyticsEventName, type AnalyticsEventName } from "@/lib/analytics";
import type { Locale } from "@/lib/site";

const labels = {
  en: {
    options: "Privacy options", preferences: "Analytics preferences", close: "Close preferences", accept: "Accept analytics", decline: "Decline", privacy: "Privacy",
    enabled: { title: "May I measure your visit?", description: "Plausible and PostHog measure visits and clicks to improve this site. No advertising or session recording." },
    blocked: { title: "Your browser has disabled analytics", description: "We respect your privacy signal. To allow analytics, first change the preference in your browser." },
  },
  es: {
    options: "Opciones de privacidad", preferences: "Preferencias de analítica", close: "Cerrar preferencias", accept: "Aceptar analítica", decline: "Rechazar", privacy: "Privacidad",
    enabled: { title: "¿Puedo medir tu visita?", description: "Plausible y PostHog miden visitas y clics para mejorar este sitio. Sin publicidad ni grabación de sesiones." },
    blocked: { title: "Tu navegador ha desactivado la analítica", description: "Respetamos tu señal de privacidad. Para permitir la analítica, cambia primero la preferencia de tu navegador." },
  },
};

const KEY = "portfolio_analytics";
const CHANGE = "portfolio:privacy";
let visitor: string | undefined;

function privacySignal() {
  return navigator.doNotTrack === "1" || ("globalPrivacyControl" in navigator && navigator.globalPrivacyControl === true);
}
function snapshot() {
  if (privacySignal()) return "blocked";
  try {
    const value = localStorage.getItem(KEY);
    return value === "accepted" || value === "declined" ? value : "unset";
  }
  catch { return "declined"; }
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(CHANGE, callback); };
}
function serverSnapshot() { return "unknown"; }

export function Analytics({ locale }: { locale: Locale }) {
  const path = usePathname();
  const consent = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const preferencesTrigger = useRef<HTMLButtonElement>(null);
  const copy = labels[locale];
  const message = copy[consent === "blocked" ? "blocked" : "enabled"];

  function closePreferences() {
    setSettingsOpen(false);
    if (settingsOpen) preferencesTrigger.current?.focus({ preventScroll: true });
  }

  function choose(value: "accepted" | "declined") {
    try { localStorage.setItem(KEY, value); }
    catch { return; }
    window.dispatchEvent(new Event(CHANGE));
    closePreferences();
  }

  useEffect(() => {
    if (consent !== "accepted" || privacySignal()) {
      visitor = undefined;
      return;
    }
    visitor ??= crypto.randomUUID();
    function send(name: AnalyticsEventName) {
      const payload = JSON.stringify({ name, path, visitor, consent: true });
      navigator.sendBeacon("/api/events", payload);
    }
    send("pageview");
    function click(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[data-track]");
      const name = link?.dataset.track;
      if (name && isAnalyticsEventName(name)) send(name);
    }
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, [consent, path]);

  return <>
    <div className="mx-auto flex max-w-[1320px] justify-end px-5 pb-6 sm:px-10"><button ref={preferencesTrigger} type="button" onClick={() => setSettingsOpen(true)} className="min-h-11 text-[11px] text-muted underline decoration-ink/20 underline-offset-4">{copy.options}</button></div>
    {(consent === "unset" || settingsOpen) && <section aria-label={copy.preferences} className="fixed bottom-4 left-4 right-4 z-30 mx-auto max-w-[560px] rounded-2xl bg-white p-5 shadow-[0_8px_50px_rgba(33,41,28,.15)] sm:bottom-6"><div className="flex items-start justify-between gap-5"><div><p className="text-sm font-medium">{message.title}</p><p className="mt-1.5 text-xs leading-relaxed text-muted">{message.description}</p></div>{settingsOpen && <button type="button" onClick={closePreferences} aria-label={copy.close} className="min-h-8 min-w-8 text-xl">×</button>}</div><div className="mt-4 flex flex-wrap items-center gap-3">{consent !== "blocked" && <><button type="button" onClick={() => choose("accepted")} className="min-h-10 rounded-full bg-ink px-5 text-xs text-white">{copy.accept}</button><button type="button" onClick={() => choose("declined")} className="min-h-10 rounded-full bg-mist px-5 text-xs text-ink">{copy.decline}</button></>}<a href={`/${locale}/privacy`} className="ml-auto min-h-10 content-center text-xs text-muted underline underline-offset-4">{copy.privacy}</a></div></section>}
  </>;
}
