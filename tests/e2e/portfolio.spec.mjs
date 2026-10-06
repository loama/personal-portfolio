import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PDFDocument } from "pdf-lib";
test("founder, team, language and resume navigation work", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/en");
  await expect(page).toHaveURL(/\/en\/resume\/founder$/);
  await expect(page).toHaveTitle(/Eduardo L\u00F3pez/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Eduardo López");
  const footer = page.getByRole("contentinfo");
  await expect(page.getByRole("navigation", { name: "Resume version", exact: true })).toHaveCount(0);
  await expect(footer.getByRole("link", { name: "Employee & consultant", exact: true })).toHaveCount(0);
  const source = footer.getByRole("link", { name: "Source code", exact: true });
  await expect(source).toHaveAttribute("href", "https://github.com/loama/personal-portfolio");
  await expect(source).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("button", { name: "Privacy options", exact: true })).toHaveCount(0);
  await expect(page.locator("header .wordmark")).toContainText("you can call me edu");
  const profile = page.getByRole("region", { name: "Profile", exact: true });
  for (const name of ["JSON", "WhatsApp"]) {
    await expect(profile.getByRole("link", { name, exact: true })).toHaveCSS("text-decoration-line", "underline");
  }
  await expect(page.getByRole("link", { name: "Projects", exact: true })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Profile", exact: true }).getByRole("img", { name: "Eduardo López", exact: true })).toBeVisible();
  await expect(page.locator("#work").getByRole("link", { name: "Visit Supervisor", exact: true })).toHaveAttribute("href", "https://trysupervisor.com");
  await expect(page.locator("#work").getByRole("link", { name: "Visit Constructor", exact: true })).toHaveAttribute("href", "https://useconstructor.com");
  await page.getByRole("button", { name: "Decline", exact: true }).click();
  await page.goto("/en/resume/employee");
  await expect(page).toHaveURL(/\/en\/resume\/employee$/);
  await expect(page.getByRole("region", { name: "Profile", exact: true }).getByText("Full stack AI engineer", { exact: true })).toBeVisible();
  await page.getByRole("navigation", { name: "Language", exact: true }).getByRole("link", { name: "ES" }).click();
  await expect(page).toHaveURL(/\/es\/resume\/employee$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page.locator("header .wordmark").click();
  await expect(page).toHaveURL(/\/es\/resume\/founder$/);
  await expect(footer.getByRole("link", { name: "Empleado y consultor", exact: true })).toHaveCount(0);
  await expect(footer.getByRole("link", { name: "Código fuente", exact: true })).toHaveAttribute("href", "https://github.com/loama/personal-portfolio");
  await expect(page.locator("header .wordmark")).toContainText("puedes llamarme edu");
  await expect(page.getByRole("link", { name: "Descargar PDF" })).toHaveAttribute("href", "/resume/eduardo-lopez-founder-es.pdf");
  await page.goBack();
  await expect(page).toHaveURL(/\/es\/resume\/employee$/);
  await expect(footer.getByRole("link", { name: "Fundador", exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("previous landing and project links reach the relevant resume", async ({ page }) => {
  for (const locale of ["en", "es"]) {
    for (const [source, destination] of [
      ["", "/resume/founder"],
      ["/work", "/resume/employee"],
      ["/work/amiloz", "/resume/founder#experience-amiloz"],
      ["/work/nixtla", "/resume/employee#experience-nixtla"],
    ]) {
      await page.goto(`/${locale}${source}`);
      await expect(page).toHaveURL(`/${locale}${destination}`);
      const target = destination.split("#")[1];
      if (target) await expect(page.locator(`#${target}`)).toBeInViewport();
    }
  }
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`page navigation opens at the top at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/en/resume/founder");
    await page.getByRole("button", { name: "Decline", exact: true }).click();
    for (const locale of ["en", "es"]) {
      for (const version of ["founder", "employee"]) {
        const name = locale === "es" ? "Para agentes" : "For agents";
        for (const y of [0, 400]) {
          await page.goto(`/${locale}/resume/${version}`);
          await page.evaluate(() => document.fonts.ready);
          await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
          await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
          const link = page.getByRole("contentinfo").getByRole("link", { name, exact: true });
          if (y === 0) await link.click();
          else await link.dispatchEvent("click");
          await expect(page).toHaveURL(`/${locale}/agents`);
          await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
          await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
        }
      }
    }
  });

  test(`language changes preserve scroll and resume version at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const path of ["/resume/founder", "/resume/employee", "/agents", "/privacy"]) {
      await page.goto(`/en${path}`);
      await page.evaluate(() => document.fonts.ready);
      for (const y of [0, 400]) {
        let expectedScroll = await page.evaluate((requested) => Math.min(requested, Math.max(0, document.documentElement.scrollHeight - innerHeight)), y);
        await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), expectedScroll);
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(expectedScroll);
        for (const lang of ["es", "en"]) {
          const link = page.getByRole("navigation", { name: /^(Language|Idioma)$/ }).getByRole("link", { name: lang.toUpperCase(), exact: true });
          if (y === 0) await link.click();
          else await link.dispatchEvent("click");
          await expect(page).toHaveURL(`/${lang}${path}`);
          await expect(page.locator("html")).toHaveAttribute("lang", lang);
          await page.evaluate(() => document.fonts.ready);
          expectedScroll = await page.evaluate((previous) => Math.min(previous, Math.max(0, document.documentElement.scrollHeight - innerHeight)), expectedScroll);
          await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(expectedScroll);
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
    const targetHeights = await page.getByRole("navigation", { name: "Language", exact: true }).getByRole("link").evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
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
  for (const path of ["/en/resume/founder", "/es/resume/founder", "/en/resume/employee", "/es/resume/employee", "/en/agents", "/es/privacy"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations, `${path}: ${JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`).toEqual([]);
  }
});
test("resume company logos load and fit phone and desktop layouts", async ({ page }, testInfo) => {
  for (const variant of [{ locale: "en", version: "employee", decline: "Decline" }, { locale: "es", version: "founder", decline: "Rechazar" }]) {
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      await page.goto(`/${variant.locale}/resume/${variant.version}`);
      const decline = page.getByRole("button", { name: variant.decline, exact: true });
      if (await decline.isVisible()) await decline.click();
      const entries = page.locator("#experience article");
      await expect(entries.first().getByRole("heading", { level: 3 })).toHaveText("Supervisor");
      const logos = entries.locator(".company-logo");
      await expect(logos).toHaveCount(9);
      for (const logo of await logos.all()) {
        await logo.scrollIntoViewIfNeeded();
        await expect.poll(() => logo.evaluate(async (element) => {
          const source = element instanceof HTMLImageElement
            ? element.currentSrc
            : getComputedStyle(element).maskImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
          if (!source) return false;
          const image = new Image();
          image.src = source;
          await image.decode();
          return image.naturalWidth > 0 && image.naturalHeight > 0;
        })).toBe(true);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (testInfo.project.name === "chromium" && variant.locale === "en") {
        await page.getByRole("heading", { level: 1 }).scrollIntoViewIfNeeded();
        await page.screenshot({ path: join(process.env.QA_ARTIFACT_DIR ?? join(tmpdir(), "eduardo-portfolio-qa"), `resume-${width}.png`), fullPage: true, animations: "disabled" });
      }
    }
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
  await page.getByRole("contentinfo").getByRole("link", { name: "Privacy", exact: true }).click();
  await page.getByRole("button", { name: "Privacy options", exact: true }).click();
  await page.getByRole("button", { name: "Decline", exact: true }).click();
  events.length = 0;
  await page.reload();
  await expect(page.getByRole("button", { name: "Accept analytics", exact: true })).toHaveCount(0);
  expect(events).toEqual([]);
});
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  for (const copy of [
    { locale: "en", privacy: "Privacy", options: "Privacy options", preferences: "Analytics preferences", close: "Close preferences", accept: "Accept analytics", decline: "Decline" },
    { locale: "es", privacy: "Privacidad", options: "Opciones de privacidad", preferences: "Preferencias de analítica", close: "Cerrar preferencias", accept: "Aceptar analítica", decline: "Rechazar" },
  ]) {
    test(`privacy preferences restore keyboard focus without changing scroll in ${copy.locale} at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
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
        await expect(trigger).toHaveCount(0);
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400);
      }
      await page.getByRole("contentinfo").getByRole("link", { name: copy.privacy, exact: true }).click();
      await expect(trigger).toBeVisible();
      for (const action of [copy.close, copy.accept, copy.decline]) {
        for (const activation of [{ key: "Enter", delay: 0 }, { key: "Enter", delay: 100 }, { key: "Space", delay: 100 }]) {
          await trigger.press("Enter");
          await expect(preferences).toBeVisible();
          const scroll = await page.evaluate(() => Math.min(400, Math.max(0, document.documentElement.scrollHeight - innerHeight)));
          await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), scroll);
          await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scroll);
          await preferences.getByRole("button", { name: action, exact: true }).press(activation.key, { delay: activation.delay });
          await expect(preferences).toHaveCount(0);
          await expect(trigger).toBeFocused();
          await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scroll);
        }
      }
    });
  }
}
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
  await expect(page.getByRole("button", { name: "Privacy options", exact: true })).toHaveCount(0);
  await page.getByRole("contentinfo").getByRole("link", { name: "Privacy", exact: true }).click();
  await page.getByRole("button", { name: "Privacy options", exact: true }).click();
  await expect(page.getByText("Your browser has disabled analytics")).toBeVisible();
  await expect(page.getByRole("button", { name: "Accept analytics", exact: true })).toHaveCount(0);
  expect(events).toEqual([]);
});

test("resume disclosures retain public work and contact links", async ({ page }) => {
  for (const copy of [
    { locale: "en", more: "More about this work at Nixtla", title: "Selected public work", route: "Put the fix where the routes live", workflow: "Replace the previous documentation output" },
    { locale: "es", more: "Más sobre este trabajo en Nixtla", title: "Trabajo público seleccionado", route: "Corregir las rutas donde se gestionan", workflow: "Sustituir la documentación anterior" },
  ]) {
    await page.goto(`/${copy.locale}/resume/employee`);
    const experience = page.locator("#experience-nixtla");
    await expect(experience.getByRole("heading", { name: copy.title, exact: true })).not.toBeVisible();
    await experience.locator("summary").filter({ hasText: copy.more }).click();
    await expect(experience.getByRole("heading", { name: copy.title, exact: true })).toBeVisible();
    await expect(experience.getByRole("link", { name: copy.route, exact: true })).toHaveAttribute("href", "https://github.com/Nixtla/nixtla/pull/855");
    await expect(experience.getByRole("link", { name: copy.workflow, exact: true })).toHaveAttribute("href", "https://github.com/Nixtla/docs/commit/e9a8c4b88fe67e19673a459ae564697030ab12df");
    await expect(page.locator("#contact").getByRole("link", { name: "WhatsApp", exact: true })).toHaveAttribute("href", "https://wa.me/34637432670");
    await expect(page.locator("#contact").getByRole("link", { name: "hello@eduardo-lopez.com", exact: true })).toHaveAttribute("href", "mailto:hello@eduardo-lopez.com");
    await experience.locator("summary").filter({ hasText: copy.more }).press("Enter");
    await expect(experience.getByRole("heading", { name: copy.title, exact: true })).not.toBeVisible();
  }
});
