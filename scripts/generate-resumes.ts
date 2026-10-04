import { mkdir, readFile, writeFile } from "node:fs/promises";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, PDFString } from "pdf-lib";
import { getResume } from "../src/lib/resume";
import { getCompanyLogo } from "../src/lib/company-logos";
import { contacts, LOCALES, PDF_LENGTHS, VERSIONS, resumePath, SITE_URL } from "../src/lib/site";

const ink = rgb(0.125, 0.141, 0.122);
const muted = rgb(0.35, 0.38, 0.33);
const olive = rgb(0.28, 0.36, 0.23);
const regularFontBytes = await readFile("assets/fonts/LiberationSans-Regular.ttf");
const boldFontBytes = await readFile("assets/fonts/LiberationSans-Bold.ttf");
await mkdir("public/resume", { recursive: true });

for (const locale of LOCALES) {
  for (const version of VERSIONS) {
    const resume = getResume(locale, version);
    await writeFile(
      `public${resumePath(locale, version, "json")}`,
      `${JSON.stringify(resume, null, 2)}\n`,
    );
    for (const length of PDF_LENGTHS) {
      const full = length === "full";
      const pdf = await PDFDocument.create();
      pdf.registerFontkit(fontkit);
      const regular = await pdf.embedFont(regularFontBytes, {
        subset: false,
        features: { liga: false },
      });
      const bold = await pdf.embedFont(boldFontBytes, { subset: false, features: { liga: false } });
      let page = pdf.addPage([595.28, 841.89]);
      const margin = 44;
      const width = 507.28;
      let y = 795;
      let expanded = false;
      let currentCompany = "";
      const spanish = locale === "es";
      const fixedDate = new Date(`${resume.meta.lastModified}T00:00:00Z`);
      pdf.setTitle(
        `Eduardo López | ${version === "founder" ? (spanish ? "Fundador" : "Founder") : spanish ? "Ingeniería y consultoría" : "Engineering & consulting"}${full ? (spanish ? " | Detallado" : " | Detailed") : ""}`,
      );
      pdf.setAuthor("Eduardo López");
      pdf.setSubject(resume.basics.label);
      pdf.setCreationDate(fixedDate);
      pdf.setModificationDate(fixedDate);
      pdf.setProducer("eduardo-lopez.com");
      pdf.setCreator("eduardo-lopez.com");

      function linesFor(value: string, size: number, weight = false, inset = 0) {
        const font = weight ? bold : regular;
        const lines: string[] = [];
        let line = "";
        for (const word of value.split(/\s+/)) {
          const candidate = line ? `${line} ${word}` : word;
          if (font.widthOfTextAtSize(candidate, size) > width - inset && line) {
            lines.push(line);
            line = word;
          } else line = candidate;
        }
        if (line) lines.push(line);
        return lines;
      }

      function detailPage() {
        page = pdf.addPage([595.28, 841.89]);
        page.drawText(resume.basics.name, { x: margin, y: 796, font: bold, size: 12, color: ink });
        page.drawText(resume.basics.label, {
          x: margin,
          y: 778,
          font: regular,
          size: 9,
          color: muted,
        });
        page.drawLine({
          start: { x: margin, y: 766 },
          end: { x: margin + width, y: 766 },
          thickness: 0.5,
          color: rgb(0.79, 0.81, 0.77),
        });
        y = 742;
        if (currentCompany) {
          page.drawText(`${currentCompany} · ${spanish ? "continuación" : "continued"}`, {
            x: margin,
            y,
            font: bold,
            size: 11,
            color: ink,
          });
          y -= 24;
        }
      }

      function ensureSpace(height: number) {
        const bottom = expanded ? 62 : 48;
        if (y - height >= bottom) return;
        if (!expanded) throw new Error(`Resume exceeds one page: ${locale}/${version}`);
        detailPage();
      }

      function text(value: string, size = 9.1, weight = false, color = ink, gap = 3.6, inset = 0) {
        const font = weight ? bold : regular;
        const lines = linesFor(value, size, weight, inset);
        if (expanded) ensureSpace(lines.length * (size + gap));
        for (const value of lines) {
          ensureSpace(size);
          page.drawText(value, { x: margin + inset, y, size, font, color });
          y -= size + gap;
        }
      }

      async function companyLogo(name: string, size: number, baselineOffset: number) {
        const path = getCompanyLogo(name);
        if (!path) return 0;
        const image = await pdf.embedPng(await readFile(`public${path}`));
        page.drawImage(image, { x: margin, y: y + baselineOffset, width: size, height: size });
        return size + 8;
      }

      function link(label: string, href: string, x: number, baseline: number, size = 8.6) {
        const w = regular.widthOfTextAtSize(label, size);
        page.drawText(label, { x, y: baseline, size, font: regular, color: muted });
        const annotation = pdf.context.register(
          pdf.context.obj({
            Type: "Annot",
            Subtype: "Link",
            Rect: [x, baseline - 2, x + w, baseline + size + 2],
            Border: [0, 0, 0],
            A: { Type: "Action", S: "URI", URI: PDFString.of(href) },
          }),
        );
        page.node.addAnnot(annotation);
        return x + w + 16;
      }

      function section(label: string) {
        y -= 8;
        page.drawLine({
          start: { x: margin, y: y + 5 },
          end: { x: margin + width, y: y + 5 },
          thickness: 0.5,
          color: rgb(0.79, 0.81, 0.77),
        });
        y -= 8;
        text(label.toLocaleUpperCase(locale), 8, true, olive, 6);
      }

      const label =
        version === "founder"
          ? spanish
            ? "PERFIL DE FUNDADOR"
            : "FOUNDER PROFILE"
          : spanish
            ? "INGENIERÍA Y CONSULTORÍA"
            : "ENGINEERING & CONSULTING";
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
        const formatDate = (value: string) =>
          new Intl.DateTimeFormat(locale, {
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          }).format(new Date(`${value}-01T00:00:00Z`));
        const dates = work.startDate
          ? `${formatDate(work.startDate)} ${spanish ? "a" : "to"} ${work.endDate ? formatDate(work.endDate) : spanish ? "presente" : "present"}`
          : work.endDate
            ? `${spanish ? "Hasta" : "Through"} ${formatDate(work.endDate)}`
            : spanish
              ? "Actualidad"
              : "Present";
        const inset = await companyLogo(work.name, 24, -15);
        text(`${work.name}  |  ${work.position}`, 11, true, ink, 3, inset);
        text(dates, 8.7, false, muted, 4, inset);
        for (const highlight of work.highlights) text(highlight, 10.1, false, ink, 3.5);
        y -= 5;
      }

      section(spanish ? "Experiencia anterior" : "Earlier experience");
      for (const work of resume.work.slice(4)) {
        const years =
          work.startDate?.slice(0, 4) === work.endDate?.slice(0, 4)
            ? work.startDate!.slice(0, 4)
            : `${work.startDate?.slice(0, 4)} ${spanish ? "a" : "to"} ${work.endDate?.slice(0, 4)}`;
        const inset = await companyLogo(work.name, 12, -2);
        text(
          `${work.name} (${years}). ${work.position}. ${work.summary}`,
          9.5,
          false,
          ink,
          3.4,
          inset,
        );
      }

      section(spanish ? "Herramientas y formación" : "Tools & background");
      text(resume.skills.flatMap((skill) => skill.keywords).join(" · "), 9.3, false, ink, 3.6);
      text(
        spanish
          ? "Y Combinator W22 · Platanus Ventures 2023 · Dev.F 2015 · Español e inglés"
          : "Y Combinator W22 · Platanus Ventures 2023 · Dev.F 2015 · Spanish and English",
        8.5,
        false,
        ink,
        3.6,
      );

      const remaining = Math.round(y - 48);

      if (full) {
        expanded = true;
        detailPage();
        text(spanish ? "Experiencia en detalle" : "Experience in detail", 20, true, ink, 16);

        for (const work of resume.work.filter((work) => work.details.length > 0)) {
          currentCompany = "";
          const first = work.details[0];
          const firstHeight =
            linesFor(first.title, 10.5, true).length * 17.5 +
            first.paragraphs.reduce(
              (height, paragraph) => height + linesFor(paragraph, 10.5).length * 15 + 7,
              0,
            );
          ensureSpace(50 + firstHeight);
          currentCompany = work.name;
          const inset = await companyLogo(work.name, 24, -15);
          text(work.name, 14, true, ink, 5, inset);
          text(work.position, 9.5, false, muted, 11, inset);

          for (const detail of work.details) {
            const titleHeight = linesFor(detail.title, 10.5, true).length * 17.5;
            const paragraphsHeight = detail.paragraphs.reduce(
              (height, paragraph) => height + linesFor(paragraph, 10.5).length * 15 + 7,
              0,
            );
            ensureSpace(titleHeight + paragraphsHeight);
            text(detail.title, 10.5, true, ink, 7);
            for (const paragraph of detail.paragraphs) {
              text(paragraph, 10.5, false, ink, 4.5);
              y -= 7;
            }
            y -= 5;
          }
          y -= 15;
        }
      }

      const pages = pdf.getPages();
      for (const [index, footerPage] of pages.entries()) {
        page = footerPage;
        link("LinkedIn", contacts.linkedin, margin, 28, 8);
        link("X", contacts.x, 95, 28, 8);
        link("Supervisor", "https://trysupervisor.com", 119, 28, 8);
        link("Constructor", "https://useconstructor.com", 176, 28, 8);
        link(
          spanish ? "Currículum y JSON" : "Resume & JSON",
          `${SITE_URL}/${locale}/resume/${version}`,
          full ? 375 : 426,
          28,
          8,
        );
        if (full) {
          const number = `${index + 1} / ${pages.length}`;
          page.drawText(number, {
            x: margin + width - regular.widthOfTextAtSize(number, 8),
            y: 28,
            size: 8,
            font: regular,
            color: muted,
          });
        }
      }

      await writeFile(`public${resumePath(locale, version, "pdf", length)}`, await pdf.save());
      console.log(
        `${locale}/${version}/${length}: ${pages.length} pages, summary space ${remaining} pt`,
      );
    }
  }
}
