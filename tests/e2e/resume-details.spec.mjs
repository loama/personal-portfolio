import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PDFDocument } from "pdf-lib";

for (const locale of ["en", "es"]) {
  for (const version of ["founder", "employee"]) {
    test(`${locale} ${version} experience details work with keyboard and fit both layouts`, async ({ page }) => {
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 960 });
        await page.goto(`/${locale}/resume/${version}`);
        const decline = page.getByRole("button", { name: locale === "es" ? "Rechazar" : "Decline", exact: true });
        if (await decline.isVisible()) await decline.click();

        const nixtla = page.locator("main article").filter({ has: page.getByRole("heading", { name: "Nixtla", exact: true }) });
        const disclosure = nixtla.locator("details");
        const summary = disclosure.locator("summary");
        const detailHeading = nixtla.getByRole("heading", { name: locale === "es" ? "El primer ingeniero web" : "The first web engineer", exact: true });
        await expect(nixtla).toContainText(locale === "es" ? "Actualidad" : "Present");
        await expect(disclosure).not.toHaveAttribute("open");
        await expect(detailHeading).not.toBeVisible();
        await summary.press("Enter");
        await expect(disclosure).toHaveAttribute("open");
        await expect(detailHeading).toBeVisible();
        await summary.press("Space");
        await expect(disclosure).not.toHaveAttribute("open");
        await expect(summary).toBeFocused();

        const consulting = page.locator("main article").filter({ has: page.getByRole("heading", { name: locale === "es" ? "Consultoría" : "Independent", exact: true }) });
        await consulting.locator("summary").click();
        for (const project of ["Selia", "MarketPryce", "Ciro"]) await expect(consulting.getByRole("heading", { name: project, exact: true })).toBeVisible();
        await expect(consulting).toContainText(locale === "es" ? "no incluyó programación" : "did not include writing code");
        await expect(consulting).toContainText(locale === "es" ? "miles de clientes" : "thousands of customers");

        const links = page.locator("aside");
        for (const platform of ["LinkedIn", "X"]) {
          const link = links.getByRole("link", { name: platform, exact: true });
          await expect(link.locator("svg[aria-hidden='true']")).toBeVisible();
        }
        await expect(links.getByRole("link", { name: "LinkedIn", exact: true })).toHaveAttribute("href", "https://www.linkedin.com/in/eduardolopezamaya/");
        await expect(links.getByRole("link", { name: "X", exact: true })).toHaveAttribute("href", "https://x.com/eduardo_lop__");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const accessibility = await new AxeBuilder({ page }).include("main").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        expect(accessibility.violations).toEqual([]);
      }
      expect(errors).toEqual([]);
    });
  }
}

test("detailed downloads and JSON include the matching experience record", async ({ request }) => {
  for (const lang of ["en", "es"]) {
    for (const version of ["founder", "employee"]) {
      const query = `lang=${lang}&version=${version}`;
      const api = await request.get(`/api/resume?${query}`);
      const resume = await api.json();
      const exported = await request.get(`/resume/eduardo-lopez-${version}-${lang}.json`);
      expect(await exported.json()).toEqual(resume);
      expect(resume.work.find((work) => work.name === "Nixtla").details.length).toBeGreaterThan(0);
      for (const length of ["short", "full"]) {
        const response = await request.get(`/api/resume?${query}&format=pdf&length=${length}`);
        expect(response.status()).toBe(200);
        expect(response.headers()["content-type"]).toContain("application/pdf");
        const pdf = await PDFDocument.load(await response.body());
        if (length === "short") expect(pdf.getPageCount()).toBe(1);
        else expect(pdf.getPageCount()).toBeGreaterThan(1);
      }
    }
  }
  expect((await request.get("/api/resume?format=pdf&length=long")).status()).toBe(400);
});

test("the detailed PDF button downloads the full document and records the action after consent", async ({ page }) => {
  await page.goto("/en/resume/employee");
  await page.getByRole("button", { name: "Privacy options", exact: true }).click();
  await page.getByRole("button", { name: "Accept analytics", exact: true }).click();
  const event = page.waitForRequest((request) => request.url().endsWith("/api/events") && request.postDataJSON().name === "download_pdf_full");
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Detailed PDF", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("eduardo-lopez-employee-en-full.pdf");
  expect((await event).postDataJSON()).toMatchObject({ name: "download_pdf_full", path: "/en/resume/employee", consent: true });
});
