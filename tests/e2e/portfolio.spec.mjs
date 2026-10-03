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
  await expect(page).toHaveURL(/\/es$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(spanishNavigation.getByRole("link", { name: "Proyectos", exact: true })).toHaveAttribute("aria-current", "location");
  await page.goBack();
  await expect(page).toHaveURL(/\/es\/resume\/founder$/);
  await expect(spanishNavigation.getByRole("link", { name: "Currículum", exact: true })).toHaveAttribute("aria-current", "page");
  expect(errors).toEqual([]);
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`page navigation opens at the top at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const locale of ["en", "es"]) {
      for (const path of ["", "/work", "/resume/founder", "/resume/employee"]) {
        const isResume = path.startsWith("/resume/");
        const name = isResume ? (locale === "es" ? "Proyectos" : "Projects") : (locale === "es" ? "Currículum" : "Resume");
        const destination = isResume ? `/${locale}` : `/${locale}/resume/${path === "/work" ? "employee" : "founder"}`;
        for (const y of [0, 400]) {
          await page.goto(`/${locale}${path}`);
          await page.evaluate(() => document.fonts.ready);
          await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
          await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
          const link = page.getByRole("navigation", { name: /^(Main navigation|Navegación principal)$/ }).getByRole("link", { name, exact: true });
          if (y === 0) {
            await link.click();
          } else {
            // Keep the source scroll position until the navigation handles it.
            await link.dispatchEvent("click");
          }
          await expect(page).toHaveURL(destination);
          await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
          await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
        }
      }
    }
  });

  test(`language changes preserve scroll and resume version at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const path of ["", "/work", "/resume/founder", "/resume/employee"]) {
      await page.goto(`/en${path}`);
      await page.evaluate(() => document.fonts.ready);
      for (const y of [0, 400]) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
        for (const lang of ["es", "en"]) {
          const link = page.getByRole("navigation", { name: /^(Language|Idioma)$/ }).getByRole("link", { name: lang.toUpperCase(), exact: true });
          if (y === 0) {
            await link.click();
          } else {
            // Activate the link without the test runner scrolling the header into view.
            await link.dispatchEvent("click");
          }
          await expect(page).toHaveURL(`/${lang}${path}`);
          await expect(page.locator("html")).toHaveAttribute("lang", lang);
          await page.evaluate(() => document.fonts.ready);
          await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
        }
      }
    }
  });
}

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
test("privacy preferences restore keyboard focus without changing scroll", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const copy of [
      { locale: "en", options: "Privacy options", preferences: "Analytics preferences", close: "Close preferences", accept: "Accept analytics", decline: "Decline" },
      { locale: "es", options: "Opciones de privacidad", preferences: "Preferencias de analítica", close: "Cerrar preferencias", accept: "Aceptar analítica", decline: "Rechazar" },
    ]) {
      await page.goto(`/${copy.locale}/resume/founder`);
      const trigger = page.getByRole("button", { name: copy.options, exact: true });
      const preferences = page.getByRole("region", { name: copy.preferences, exact: true });
      for (const choice of [copy.accept, copy.decline]) {
        await page.evaluate(() => localStorage.removeItem("portfolio_analytics"));
        await page.reload();
        await expect(preferences).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400);
        await preferences.getByRole("button", { name: choice, exact: true }).press("Enter");
        await expect(preferences).toHaveCount(0);
        await expect(trigger).not.toBeFocused();
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400);
      }
      for (const action of [copy.close, copy.accept, copy.decline]) {
        await trigger.press("Enter");
        await expect(preferences).toBeVisible();
        await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400);
        await preferences.getByRole("button", { name: action, exact: true }).press("Enter");
        await expect(preferences).toHaveCount(0);
        await expect(trigger).toBeFocused();
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400);
      }
    }
  }
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
  await expect(page.locator("#contact")).toBeInViewport();
  await page.getByRole("link", { name: "Read about the work", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/work\/nixtla$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.getByRole("navigation", { name: "Language", exact: true }).getByRole("link", { name: "ES" }).click();
  await expect(page).toHaveURL(/\/es\/work\/nixtla$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("La parte web");
  await page.getByRole("link", { name: "Siguiente: Amiloz", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/work\/amiloz$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
