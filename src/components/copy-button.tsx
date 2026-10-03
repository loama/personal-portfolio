"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";

export function CopyButton({ value, locale }: { value: string; locale: "en" | "es" }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  async function copy() {
    try { await navigator.clipboard.writeText(value); setStatus("copied"); }
    catch { setStatus("failed"); }
  }
  return <div className="flex flex-wrap items-center gap-3"><button type="button" onClick={copy} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-mist px-4 text-xs font-medium transition-colors hover:bg-[#dfe5d6]">{status === "copied" ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}{status === "copied" ? (locale === "es" ? "Copiado" : "Copied") : (locale === "es" ? "Copiar" : "Copy")}</button><span role="status" className="text-xs text-muted">{status === "failed" ? (locale === "es" ? "No se pudo copiar. Selecciona el texto y cópialo manualmente." : "Couldn't copy. Select the text and copy it manually.") : status === "copied" ? (locale === "es" ? "Copiado al portapapeles." : "Copied to clipboard.") : ""}</span></div>;
}
