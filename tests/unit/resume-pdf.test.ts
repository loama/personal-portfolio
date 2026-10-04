import { expect, test } from "bun:test";
import fontkit from "@pdf-lib/fontkit";
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFRawStream, decodePDFRawStream } from "pdf-lib";
import { LOCALES, PDF_LENGTHS, VERSIONS, resumePath } from "../../src/lib/site";

for (const locale of LOCALES) {
  for (const version of VERSIONS) {
    for (const length of PDF_LENGTHS) {
      test(`${locale} ${version} ${length} PDF includes valid fonts and searchable character mappings on every page`, async () => {
        const pdf = await PDFDocument.load(
          await Bun.file(`public${resumePath(locale, version, "pdf", length)}`).arrayBuffer(),
        );
        if (length === "short") expect(pdf.getPageCount()).toBe(1);
        else expect(pdf.getPageCount()).toBeGreaterThan(1);
        const references = new Map();
        for (const page of pdf.getPages()) {
          expect(page.getWidth()).toBeCloseTo(595.28);
          expect(page.getHeight()).toBeCloseTo(841.89);
          const fonts = page.node.Resources()!.lookup(PDFName.of("Font"), PDFDict);
          expect(fonts.entries().length).toBeGreaterThan(0);
          for (const [, reference] of fonts.entries())
            references.set(reference.toString(), reference);
        }
        expect(references.size).toBeGreaterThan(0);

        for (const reference of references.values()) {
          const font = pdf.context.lookup(reference, PDFDict);
          const descendants = font.lookup(PDFName.of("DescendantFonts"), PDFArray);
          const descriptor = descendants
            .lookup(0, PDFDict)
            .lookup(PDFName.of("FontDescriptor"), PDFDict);
          const program = descriptor.lookup(PDFName.of("FontFile2"));
          if (!(program instanceof PDFRawStream))
            throw new Error("The PDF must embed its font program.");
          const typeface = fontkit.create(decodePDFRawStream(program).decode());
          expect(typeface.numGlyphs).toBeGreaterThan(0);
          for (const character of new Set(
            "Eduardo López Ingeniería consultoría formación Español",
          )) {
            expect(typeface.hasGlyphForCodePoint(character.codePointAt(0)!)).toBe(true);
          }

          const unicode = font.lookup(PDFName.of("ToUnicode"));
          if (!(unicode instanceof PDFRawStream))
            throw new Error("The PDF must include its Unicode character mappings.");
          expect(new TextDecoder().decode(decodePDFRawStream(unicode).decode())).toContain(
            "begincmap",
          );
        }
      });
    }
  }
}
