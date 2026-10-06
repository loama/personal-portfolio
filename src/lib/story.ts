import { profile } from "./resume";
import type { Locale } from "./site";

export const STORY_CHAPTERS = [
  { id: "supervisor", scene: "supervisor", label: { en: "Now", es: "Ahora" }, title: { en: "Your business, in one place.", es: "Tu negocio, en un solo lugar." }, figure: { en: "Agent & node", es: "Agente y servidor" } },
  { id: "constructor", scene: "constructor", label: { en: "Also now", es: "También ahora" }, title: { en: "Software, built together.", es: "Software que construimos juntos." }, figure: { en: "The workspace", es: "El espacio de trabajo" } },
  { id: "amiloz", scene: "warehouse", label: { en: "Cofounder & CTO", es: "Cofundador y CTO" }, title: { en: "First the products. Then the team.", es: "Primero el producto. Después el equipo." }, figure: { en: "The warehouse", es: "El almacén" } },
  { id: "nixtla", scene: "forecast", label: { en: "Nixtla · Present", es: "Nixtla · Actualidad" }, title: { en: "The web around TimeGPT.", es: "La web alrededor de TimeGPT." }, figure: { en: "A forecast", es: "Un pronóstico" } },
  { id: "freelance", scene: "devices", label: { en: "Freelance", es: "Freelance" }, title: { en: "Helping other founders get started.", es: "Ayudar a otros fundadores a empezar." }, figure: { en: "Connected devices", es: "Dispositivos conectados" } },
  { id: "eiya", scene: "delivery", label: { en: "Eiya", es: "Eiya" }, title: { en: "Software that goes out into the city.", es: "Software que sale a la calle." }, figure: { en: "A delivery route", es: "Una ruta de reparto" } },
  { id: "earlier", scene: "desk", label: { en: "Since 2015", es: "Desde 2015" }, title: { en: "It started with the tools people needed.", es: "Empezó con las herramientas que hacían falta." }, figure: { en: "The coding desk", es: "El escritorio" } },
  { id: "cohorts", scene: "cohorts", label: { en: "Along the way", es: "En el camino" }, title: { en: "Learning with other founders.", es: "Aprender con otros fundadores." }, figure: { en: "Founder cohorts", es: "Programas de fundadores" } },
] as const;

export type StorySceneKind = (typeof STORY_CHAPTERS)[number]["scene"];
type Paragraph = { text: string; label?: string };

export function getStory(locale: Locale) {
  const work = (id: string) => {
    const entry = profile.work.find((item) => item.id === id);
    if (!entry) throw new Error(`Missing story source: ${id}`);
    return entry;
  };
  const project = (id: string) => {
    const entry = profile.projects.find((item) => item.id === id);
    if (!entry) throw new Error(`Missing story project: ${id}`);
    return entry;
  };
  const paragraphs = (id: string): Paragraph[] => {
    if (id === "supervisor") return [project(id).description[locale], ...work(id).highlights[locale].slice(0, 1)].map((text) => ({ text }));
    if (id === "constructor") return [{ text: project(id).description[locale] }];
    if (id === "freelance") return [work("consulting").summary[locale], ...work("consulting").highlights[locale]].map((text) => ({ text }));
    if (id === "eiya") return work(id).details?.[0]?.paragraphs[locale].map((text) => ({ text })) ?? [];
    if (id === "earlier") return ["betterfin", "zeel", "rappi", "centraal"].map((key) => ({ label: work(key).name, text: work(key).summary[locale] }));
    if (id === "cohorts") return profile.education.map((item) => ({ label: item.institution, text: item.area[locale] }));
    return [work(id).summary[locale], ...work(id).highlights[locale]].map((text) => ({ text }));
  };

  return STORY_CHAPTERS.map((chapter) => ({
    id: chapter.id,
    scene: chapter.scene,
    label: chapter.label[locale],
    title: chapter.title[locale],
    figure: chapter.figure[locale],
    paragraphs: paragraphs(chapter.id),
    url: chapter.id === "constructor" ? project("constructor").url : profile.work.find((item) => item.id === chapter.id)?.url,
    company: chapter.id === "constructor" ? "Constructor" : profile.work.find((item) => item.id === chapter.id)?.name,
  }));
}
