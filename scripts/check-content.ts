import { readFile } from "node:fs/promises";
import { getResume, profile } from "../src/lib/resume";
import { LOCALES, PDF_LENGTHS, VERSIONS, resumePath } from "../src/lib/site";

const forbidden = /[\u002d\u2010-\u2015\u2212]/;
const prose = [
  ...Object.values(profile.summary).flatMap(Object.values),
  ...profile.projects.flatMap((project) => Object.values(project.description)),
  ...profile.work.flatMap((work) => [
    ...Object.values(work.position), ...Object.values(work.summary),
    ...Object.values(work.highlights).flat(),
    ...(work.details ?? []).flatMap((detail) => [...Object.values(detail.title), ...Object.values(detail.paragraphs).flat()]),
  ]),
];
for (const text of prose) {
  if (forbidden.test(text)) throw new Error(`Dash character in prose: ${text}`);
  if (/lorem ipsum|placeholder|Jane Doe|John Doe/i.test(text)) throw new Error(`Placeholder copy: ${text}`);
}
for (const locale of LOCALES) {
  for (const version of VERSIONS) {
    const json = JSON.parse(await readFile(`public${resumePath(locale, version, "json")}`, "utf8"));
    if (JSON.stringify(json) !== JSON.stringify(getResume(locale, version))) throw new Error(`Stale JSON: ${locale}/${version}`);
    for (const length of PDF_LENGTHS) {
      const pdf = await readFile(`public${resumePath(locale, version, "pdf", length)}`);
      if (!pdf.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw new Error(`Invalid PDF: ${locale}/${version}/${length}`);
    }
  }
}
console.log("Bilingual content, four JSON exports, and eight PDF exports are consistent.");
