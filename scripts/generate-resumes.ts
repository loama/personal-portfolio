import { mkdir, writeFile } from "node:fs/promises";
import { PDFDocument, StandardFonts, rgb, PDFString } from "pdf-lib";
import { getResume } from "../src/lib/resume";
import { contacts, LOCALES, VERSIONS, resumePath, SITE_URL } from "../src/lib/site";

const ink = rgb(0.125, 0.141, 0.122);
const muted = rgb(0.35, 0.38, 0.33);
const olive = rgb(0.28, 0.36, 0.23);
await mkdir("public/resume", { recursive: true });

for (const locale of LOCALES) {
  for (const version of VERSIONS) {
    const resume = getResume(locale, version);
    const pdf = await PDFDocument.create();
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const page = pdf.addPage([595.28, 841.89]);
    const margin = 44;
    const width = 507.28;
    let y = 795;
    const spanish = locale === "es";
    const fixedDate = new Date("2026-10-03T00:00:00Z");
    pdf.setTitle(`Eduardo López | ${version === "founder" ? (spanish ? "Fundador" : "Founder") : (spanish ? "Ingeniería y consultoría" : "Engineering & consulting")}`);
    pdf.setAuthor("Eduardo López");
    pdf.setSubject(resume.basics.label);
    pdf.setCreationDate(fixedDate);
    pdf.setModificationDate(fixedDate);
    pdf.setProducer("eduardo-lopez.com");
    pdf.setCreator("eduardo-lopez.com");

    function text(value: string, size = 9.1, weight = false, color = ink, gap = 3.6) {
      const font = weight ? bold : regular;
      const lines: string[] = [];
      let line = "";
      for (const word of value.split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, size) > width && line) {
          lines.push(line);
          line = word;
        } else line = candidate;
      }
      if (line) lines.push(line);
      for (const value of lines) {
        if (y < 48) throw new Error(`Resume exceeds one page: ${locale}/${version}`);
        page.drawText(value, { x: margin, y, size, font, color });
        y -= size + gap;
      }
    }

    function link(label: string, href: string, x: number, baseline: number, size = 8.6) {
      const w = regular.widthOfTextAtSize(label, size);
      page.drawText(label, { x, y: baseline, size, font: regular, color: muted });
      const annotation = pdf.context.register(pdf.context.obj({
        Type: "Annot", Subtype: "Link", Rect: [x, baseline - 2, x + w, baseline + size + 2],
        Border: [0, 0, 0], A: { Type: "Action", S: "URI", URI: PDFString.of(href) },
      }));
      page.node.addAnnot(annotation);
      return x + w + 16;
    }

    function section(label: string) {
      y -= 8;
      page.drawLine({ start: { x: margin, y: y + 5 }, end: { x: margin + width, y: y + 5 }, thickness: 0.5, color: rgb(0.79, 0.81, 0.77) });
      y -= 8;
      text(label.toLocaleUpperCase(locale), 8, true, olive, 6);
    }

    const label = version === "founder" ? (spanish ? "PERFIL DE FUNDADOR" : "FOUNDER PROFILE") : (spanish ? "INGENIERÍA Y CONSULTORÍA" : "ENGINEERING & CONSULTING");
    text(label, 8.4, true, olive, 21);
    text(resume.basics.name, 29, true, ink, 6);
    text(resume.basics.label, 11.2, false, muted, 9);
    let x = link(contacts.email, `mailto:${contacts.email}`, margin, y);
    x = link(contacts.phone, contacts.whatsapp, x, y);
    link("eduardo-lopez.com", SITE_URL, x, y);
    y -= 22;
    text(resume.basics.summary, 10.4, false, ink, 4);

    section(spanish ? "Experiencia seleccionada" : "Selected experience");
    for (const work of resume.work.slice(0, 4)) {
      const formatDate = (value: string) => new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}-01T00:00:00Z`));
      const dates = work.startDate
        ? `${formatDate(work.startDate)} ${spanish ? "a" : "to"} ${work.endDate ? formatDate(work.endDate) : (spanish ? "presente" : "present")}`
        : `${spanish ? "Hasta" : "Through"} ${formatDate(work.endDate!)}`;
      text(`${work.name}  |  ${work.position}`, 11, true, ink, 3);
      text(dates, 8.7, false, muted, 4);
      for (const highlight of work.highlights) text(highlight, 10.1, false, ink, 3.5);
      y -= 5;
    }

    section(spanish ? "Experiencia anterior" : "Earlier experience");
    for (const work of resume.work.slice(4)) {
      const years = work.startDate?.slice(0, 4) === work.endDate?.slice(0, 4)
        ? work.startDate!.slice(0, 4)
        : `${work.startDate?.slice(0, 4)} ${spanish ? "a" : "to"} ${work.endDate?.slice(0, 4)}`;
      text(`${work.name} (${years}). ${work.position}. ${work.summary}`, 9.5, false, ink, 3.4);
    }

    section(spanish ? "Herramientas y formación" : "Tools & background");
    text(resume.skills.flatMap((skill) => skill.keywords).join(" · "), 9.3, false, ink, 3.6);
    text(spanish ? "Y Combinator W22 · Platanus Ventures 2023 · Dev.F 2015 · Español e inglés" : "Y Combinator W22 · Platanus Ventures 2023 · Dev.F 2015 · Spanish and English", 8.5, false, ink, 3.6);

    link("LinkedIn", contacts.linkedin, margin, 28, 8);
    link("X", contacts.x, 95, 28, 8);
    link("Supervisor", "https://trysupervisor.com", 119, 28, 8);
    link("Constructor", "https://useconstructor.com", 176, 28, 8);
    link(spanish ? "Currículum completo y JSON" : "Full resume & JSON", `${SITE_URL}/${locale}/resume/${version}`, 426, 28, 8);

    await writeFile(`public${resumePath(locale, version, "pdf")}`, await pdf.save());
    await writeFile(`public${resumePath(locale, version, "json")}`, `${JSON.stringify(resume, null, 2)}\n`);
    console.log(`${locale}/${version}: one page, remaining space ${Math.round(y - 48)} pt`);
  }
}
