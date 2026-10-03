import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PDFDocument } from "pdf-lib";
test("founder, team, language and resume navigation work", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/en");
  await expect(page).toHaveTitle(/Eduardo L\u00F3pez/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("I build software.");
  const mainNavigation = page.getByRole("navigation", { name: "Main navigation", exact: true });
  await expect(mainNavigation.getByRole("link")).toHaveCount(2);
  await expect(mainNavigation.getByRole("link", { name: "Projects", exact: true })).toHaveAttribute("aria-current", "location");
  await page.getByRole("button", { name: "Decline", exact: true }).click();
  await page.getByRole("link", { name: "For your team", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/work$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("From the idea");
  await page.getByRole("navigation", { name: "Language", exact: true }).getByRole("link", { name: "ES" }).click();
  await expect(page).toHaveURL(/\/es\/work$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page.getByRole("link", { name: "Ver mi experiencia", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/resume\/employee$/);
  await page.getByRole("navigation", { name: "Versi\xF3n del curr\xEDculum" }).getByRole("link", { name: "Fundador", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/resume\/founder$/);
  const spanishNavigation = page.getByRole("navigation", { name: "Navegación principal", exact: true });
  await expect(spanishNavigation.getByRole("link", { name: "Currículum", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "Descargar PDF" })).toHaveAttribute("href", "/resume/eduardo-lopez-founder-es.pdf");
  await spanishNavigation.getByRole("link", { name: "Proyectos", exact: true }).click();
  await expect(page).toHaveURL(/\/es#work$/);
  await expect(spanishNavigation.getByRole("link", { name: "Proyectos", exact: true })).toHaveAttribute("aria-current", "location");
  await page.goBack();
  await expect(page).toHaveURL(/\/es\/resume\/founder$/);
  await expect(spanishNavigation.getByRole("link", { name: "Currículum", exact: true })).toHaveAttribute("aria-current", "page");
  expect(errors).toEqual([]);
});
test("layout fits small phones through wide screens", async ({ page }, testInfo) => {
  await page.goto("/en");
  await page.getByRole("button", { name: "Decline", exact: true }).click();
  for (const width of [320, 390, 640, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 960 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const targetHeights = await page.getByRole("navigation", { name: "Main navigation", exact: true }).getByRole("link").evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
    expect(targetHeights.every((height) => height >= 44)).toBe(true);
  }
  if (testInfo.project.name === "chromium") {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: join(process.env.QA_ARTIFACT_DIR ?? join(tmpdir(), "eduardo-portfolio-qa"), "desktop.png"), fullPage: true, animations: "disabled" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: join(process.env.QA_ARTIFACT_DIR ?? join(tmpdir(), "eduardo-portfolio-qa"), "mobile.png"), fullPage: true, animations: "disabled" });
  }
});
test("key pages have no automated accessibility violations", async ({ page }) => {
  for (const path of ["/en", "/es", "/en/work", "/es/resume/employee", "/en/work/amiloz", "/es/work/nixtla", "/en/agents", "/es/privacy"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations, `${path}: ${JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`).toEqual([]);
  }
});
test("all four PDF and JSON downloads match the selected profile", async ({ request }) => {
  for (const lang of ["en", "es"]) {
    for (const version of ["founder", "employee"]) {
      const json = await request.get(`/api/resume?lang=${lang}&version=${version}`);
      expect(json.status()).toBe(200);
      expect((await json.json()).meta).toMatchObject({ language: lang, version });
      const pdf = await request.get(`/api/resume?lang=${lang}&version=${version}&format=pdf`);
      expect(pdf.status()).toBe(200);
      expect(pdf.headers()["content-type"]).toContain("application/pdf");
      expect((await PDFDocument.load(await pdf.body())).getPageCount()).toBe(1);
    }
  }
  expect((await request.get("/api/resume?lang=fr")).status()).toBe(400);
});
test("analytics requires consent and records the real download action", async ({ page }) => {
  const events = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/api/events"))
      events.push(request.postDataJSON());
  });
  await page.goto("/en/resume/founder");
  expect(events).toEqual([]);
  const pageview = page.waitForRequest((request) => request.url().endsWith("/api/events"));
  await page.getByRole("button", { name: "Accept analytics", exact: true }).click();
  expect((await pageview).postDataJSON()).toMatchObject({ name: "pageview", path: "/en/resume/founder", consent: true });
  const event = page.waitForRequest((request) => request.url().endsWith("/api/events") && request.postDataJSON().name === "download_pdf");
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download PDF", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("eduardo-lopez-founder-en.pdf");
  expect((await event).postDataJSON()).toMatchObject({ name: "download_pdf" });
  await page.getByRole("button", { name: "Privacy options", exact: true }).click();
  await page.getByRole("button", { name: "Decline", exact: true }).click();
  events.length = 0;
  await page.reload();
  await expect(page.getByRole("button", { name: "Accept analytics", exact: true })).toHaveCount(0);
  expect(events).toEqual([]);
});
test("keyboard, reduced motion and missing routes remain usable", async ({ page, browserName }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  // Safari on macOS includes links in keyboard navigation with Option plus Tab.
  await page.keyboard.press(browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  const response = await page.goto("/en/resume/missing");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();
});

test("browser privacy signals prevent tracking and explain the choice", async ({ page }) => {
  const events = [];
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "globalPrivacyControl", { get: () => true });
    localStorage.setItem("portfolio_analytics", "accepted");
  });
  page.on("request", (request) => {
    if (request.url().endsWith("/api/events")) events.push(request.url());
  });
  await page.goto("/en");
  await page.getByRole("button", { name: "Privacy options", exact: true }).click();
  await expect(page.getByText("Your browser has disabled analytics")).toBeVisible();
  await expect(page.getByRole("button", { name: "Accept analytics", exact: true })).toHaveCount(0);
  expect(events).toEqual([]);
});

test("case studies preserve language and team contact stays in context", async ({ page }) => {
  await page.goto("/en/work");
  await page.getByRole("button", { name: "Decline", exact: true }).click();
  await page.getByRole("link", { name: "Get in touch", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/work#contact$/);
  await page.getByRole("link", { name: "Read about the work", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/work\/nixtla$/);
  await page.getByRole("navigation", { name: "Language", exact: true }).getByRole("link", { name: "ES" }).click();
  await expect(page).toHaveURL(/\/es\/work\/nixtla$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("La parte web");
  await page.getByRole("link", { name: "Siguiente: Amiloz", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/work\/amiloz$/);
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
