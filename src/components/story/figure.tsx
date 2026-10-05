"use client";

import { useState } from "react";
import { StoryIllustration } from "./illustrations";
import type { StorySceneKind } from "@/lib/story";
import type { Locale } from "@/lib/site";

const figureCopy = {
  en: {
    supervisor: { action: "Click to run a task", states: ["standing by", "working", "task complete"] },
    constructor: { action: "Click to build", states: ["an idea", "taking shape", "ready to ship"] },
    warehouse: { action: "Click to send an order", states: ["on the shelf", "packed", "on the way"] },
    forecast: { action: "Click to forecast", states: ["history", "forecast", "confidence interval"] },
    devices: { action: "Click to connect", states: ["discover", "book", "connected"] },
    delivery: { action: "Click to follow the route", states: ["dispatch", "on the way", "delivered"] },
    desk: { action: "Click to keep building", states: ["plan", "build", "ship"] },
    cohorts: { action: "Click to explore", states: ["YC W22", "Platanus 2023", "founder cohorts"] },
  },
  es: {
    supervisor: { action: "Clic para ejecutar una tarea", states: ["en espera", "trabajando", "tarea completada"] },
    constructor: { action: "Clic para construir", states: ["una idea", "tomando forma", "listo para publicar"] },
    warehouse: { action: "Clic para enviar un pedido", states: ["en el estante", "preparado", "en camino"] },
    forecast: { action: "Clic para pronosticar", states: ["historial", "pronóstico", "intervalo de confianza"] },
    devices: { action: "Clic para conectar", states: ["descubrir", "reservar", "conectados"] },
    delivery: { action: "Clic para seguir la ruta", states: ["salida", "en camino", "entregado"] },
    desk: { action: "Clic para seguir creando", states: ["planear", "construir", "publicar"] },
    cohorts: { action: "Clic para explorar", states: ["YC W22", "Platanus 2023", "programas de fundadores"] },
  },
};

export function StoryFigure({ kind, number, label, locale }: { kind: StorySceneKind; number: number; label: string; locale: Locale }) {
  const [step, setStep] = useState(0);
  const copy = figureCopy[locale][kind];
  return <figure className="story-figure">
    <figcaption className="story-figure-caption"><span>Fig {number}</span><span>{label}</span></figcaption>
    <button type="button" className="story-figure-button" data-step={step} onClick={() => setStep((current) => (current + 1) % copy.states.length)} aria-label={`${label}. ${copy.action}`}>
      <StoryIllustration kind={kind} step={step} />
      <span className="story-figure-bottom"><span>{copy.action}</span><span role="status" aria-live="polite">{copy.states[step]}</span></span>
    </button>
  </figure>;
}
