import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const artifactDir = process.env.QA_ARTIFACT_DIR ?? join(tmpdir(), "eduardo-portfolio-qa");

async function background(page, selector = ".story-site") {
  return page.evaluate((selector) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d");
    context.fillStyle = getComputedStyle(document.querySelector(selector)).backgroundColor;
    context.fillRect(0, 0, 1, 1);
    return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
  }, selector);
}

test("the second design presents both languages and preserves its contacts", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const locale of ["en", "es"]) {
    await page.goto(`/${locale}/v2`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(locale === "en" ? "Hi, I'm Edu." : "Hola, soy Edu.");
    await expect(page.locator(".story-chapter")).toHaveCount(8);
    await expect(page.locator(".story-rail a")).toHaveCount(10);
    await expect(page.locator("#nixtla .story-eyebrow")).toContainText(locale === "en" ? "Present" : "Actualidad");
    await expect(page.locator("#about").getByRole("link", { name: "Supervisor", exact: true })).toHaveAttribute("href", "https://trysupervisor.com");
    await expect(page.locator("#about").getByRole("link", { name: "Constructor", exact: true })).toHaveAttribute("href", "https://useconstructor.com");
    await expect(page.locator("#say-hi").getByRole("link", { name: "WhatsApp", exact: true })).toHaveAttribute("href", "https://wa.me/34637432670");
    await expect(page.getByRole("link", { name: "hello@eduardo-lopez.com", exact: true })).toHaveAttribute("href", "mailto:hello@eduardo-lopez.com");
    await expect(page.locator("#say-hi").getByRole("link", { name: locale === "en" ? "Source code" : "Código fuente", exact: true })).toHaveAttribute("href", "https://github.com/loama/personal-portfolio");
    expect(await page.locator("body").evaluate((element) => getComputedStyle(element).cursor)).toContain('/images/cursor.svg") 2 2');
  }
  expect(errors).toEqual([]);
});

test("chapter links update the reading position and drawings work with a keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en/v2");
  await page.getByRole("button", { name: "Decline", exact: true }).click();
  const rail = page.getByRole("navigation", { name: "Chapters", exact: true });
  await rail.getByRole("link", { name: "Now", exact: true }).click();
  await expect(rail.getByRole("link", { name: "Now", exact: true })).toHaveAttribute("aria-current", "location");
  await expect(page.locator(".story-count")).toContainText("02");
  for (const figure of await page.locator(".story-figure-button").all()) {
    await expect(figure).toHaveAttribute("data-step", "0");
    const original = await figure.getByRole("status").innerText();
    for (const step of [1, 2, 0]) {
      await figure.press("Enter");
      await expect(figure).toHaveAttribute("data-step", String(step));
      if (step) await expect(figure.getByRole("status")).not.toHaveText(original);
      else await expect(figure.getByRole("status")).toHaveText(original);
    }
  }
  await rail.getByRole("link", { name: "Say hi", exact: true }).click();
  await expect(rail.getByRole("link", { name: "Say hi", exact: true })).toHaveAttribute("aria-current", "location");
});

for (const width of [390, 1280]) {
  test(`story language navigation retains scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en/v2");
    await page.getByRole("button", { name: "Decline", exact: true }).click();
    await page.getByRole("navigation", { name: "Chapters", exact: true }).getByRole("link", { name: "Nixtla · Present", exact: true }).click();
    await expect(page.locator(".story-rail a[aria-current]")).toHaveAttribute("href", "#nixtla");
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.locator("#nixtla").evaluate((element) => Math.round(element.getBoundingClientRect().top))).toBe(68);
    const before = await page.evaluate(() => scrollY);
    const languageLink = page.getByRole("navigation", { name: "Language", exact: true }).getByRole("link", { name: "ES", exact: true });
    await expect(languageLink).toBeInViewport();
    const bounds = await languageLink.boundingBox();
    // Click the visible sticky link without scrolling it into view first.
    await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await expect(page).toHaveURL("/es/v2");
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(before, 0);
    await page.locator(".story-nav-right").getByRole("link", { name: "CV", exact: true }).click();
    await expect(page).toHaveURL("/es/v2/resume/founder");
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
    await page.getByRole("link", { name: "Eduardo Lopez", exact: true }).click();
    await expect(page).toHaveURL("/es/v2");
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  });
}

test("the portrait stays complete and layouts fit small and large screens", async ({ page }, testInfo) => {
  for (const locale of ["en", "es"]) {
    await page.goto(`/${locale}/v2`);
    const decline = page.getByRole("button", { name: locale === "en" ? "Decline" : "Rechazar", exact: true });
    if (await decline.isVisible()) await decline.click();
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 960 });
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const image = page.locator(".story-portrait img");
      await expect(image).toBeVisible();
      const geometry = await image.evaluate(async (element) => {
        await element.decode();
        const rect = element.getBoundingClientRect();
        const frame = element.parentElement.getBoundingClientRect();
        return { ratio: rect.width / rect.height, original: 1260 / 1849, clipped: rect.height > frame.height || rect.width > frame.width };
      });
      expect(geometry.ratio).toBeCloseTo(geometry.original, 2);
      expect(geometry.clipped).toBe(false);
      expect(await page.locator(".story-figure").evaluateAll((figures) => figures.every((figure) => {
        const rect = figure.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= innerWidth;
      }))).toBe(true);
    }
  }
  if (testInfo.project.name === "chromium") {
    await page.goto("/en/v2");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({ path: join(artifactDir, "story-desktop.png"), animations: "disabled" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: join(artifactDir, "story-mobile.png"), animations: "disabled", fullPage: true });
  }
});

test("the theme persists, follows the device and leaves the original preference intact", async ({ page, context }) => {
  await page.addInitScript(() => { localStorage.setItem("portfolio_theme", "light"); localStorage.setItem("portfolio_analytics", "declined"); });
  await page.goto("/en/v2");
  const palette = () => background(page);
  await expect.poll(palette).toEqual([11, 11, 11]);
  await page.getByRole("radio", { name: "Light", exact: true }).check();
  await expect.poll(palette).toEqual([250, 250, 250]);
  await page.reload();
  await expect(page.getByRole("radio", { name: "Light", exact: true })).toBeChecked();
  await expect.poll(palette).toEqual([250, 250, 250]);
  await page.getByRole("radio", { name: "Device", exact: true }).check();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(palette).toEqual([11, 11, 11]);
  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(palette).toEqual([250, 250, 250]);
  await page.getByRole("radio", { name: "Dark", exact: true }).check();
  await page.getByRole("link", { name: "Original version", exact: true }).click();
  await expect(page).toHaveURL("/en/resume/founder");
  await expect.poll(() => background(page, "body")).toEqual([255, 255, 255]);
  expect(await page.evaluate(() => localStorage.getItem("portfolio_theme"))).toBe("light");
  expect(await page.locator("body").evaluate((element) => getComputedStyle(element).cursor)).toContain('/images/cursor.svg") 2 2');
  const other = await context.newPage();
  await other.goto("/en/v2");
  await other.getByRole("radio", { name: "Light", exact: true }).check();
  await page.goBack();
  await expect(page.getByRole("radio", { name: "Light", exact: true })).toBeChecked();
  await expect.poll(palette).toEqual([250, 250, 250]);
  await other.close();
});

test("both CV variants retain their downloads and detailed experience", async ({ page, request }) => {
  for (const locale of ["en", "es"]) {
    for (const version of ["founder", "employee"]) {
      await page.goto(`/${locale}/v2/resume/${version}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Eduardo López");
      await expect(page.locator("#experience article").first().getByRole("heading", { level: 3 })).toHaveText("Supervisor");
      await expect(page.locator(".story-cv-tools nav [aria-current]")).toHaveAttribute("href", `/${locale}/v2/resume/${version}`);
      const downloads = page.locator(".story-cv-tools div a");
      await expect(downloads).toHaveCount(3);
      for (const link of await downloads.all()) {
        const href = await link.getAttribute("href");
        expect(href).toContain(`eduardo-lopez-${version}-${locale}`);
        expect((await request.get(href)).status()).toBe(200);
      }
      const disclosure = page.locator("#experience-nixtla summary");
      await disclosure.press("Enter");
      await expect(page.locator("#experience-nixtla details")).toHaveAttribute("open", "");
      await expect(page.locator("#experience-nixtla")).toContainText(locale === "en" ? "TimeGPT and the developer experience" : "TimeGPT y la experiencia para desarrolladores");
    }
  }
  expect((await request.get("/en/v2/resume/missing")).status()).toBe(404);
});

for (const path of ["/en/v2", "/es/v2", "/en/v2/resume/founder", "/es/v2/resume/employee"]) {
  test(`${path} meets automated accessibility checks in both themes`, async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(path);
    const decline = page.getByRole("button", { name: /^(Decline|Rechazar)$/ });
    await decline.click();
    for (const theme of ["light", "dark"]) {
      await page.locator(`input[name="story-appearance"][value="${theme}"]`).check();
      await page.evaluate(async () => {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      await expect.poll(() => page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === "running" && animation.effect?.getComputedTiming().iterations !== Infinity).length)).toBe(0);
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(result.violations, `${path} ${theme}: ${JSON.stringify(result.violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })))}`).toEqual([]);
    }
  });
}

test("reduced motion and reading without JavaScript remain usable", async ({ page, browser }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/v2");
  await page.getByRole("navigation", { name: "Chapters", exact: true }).getByRole("link", { name: "Now", exact: true }).click();
  expect(await page.locator("html").evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe("auto");
  expect(await page.locator(".story-led").first().evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
  expect(await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === "running").length)).toBe(0);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto(new URL("/en/v2", page.url()).toString());
  await expect(staticPage.locator(".story-chapter")).toHaveCount(8);
  for (const heading of await staticPage.locator(".story-chapter h2").all()) await expect(heading).toBeVisible();
  await expect(staticPage.locator(".story-nav-right a[download]")).toHaveAttribute("href", "/resume/eduardo-lopez-founder-en.pdf");
  await context.close();
});

test("the new routes send visits and download actions only after consent", async ({ page }) => {
  const events = [];
  page.on("request", (request) => { if (request.url().endsWith("/api/events")) events.push(request.postDataJSON()); });
  await page.goto("/en/v2");
  expect(events).toEqual([]);
  const accepted = page.waitForResponse((response) => response.url().endsWith("/api/events"));
  await page.getByRole("button", { name: "Accept analytics", exact: true }).click();
  expect((await accepted).status()).toBe(204);
  expect(events[0]).toMatchObject({ name: "pageview", path: "/en/v2", consent: true });
  const tracked = page.waitForRequest((request) => request.url().endsWith("/api/events") && request.postDataJSON().name === "download_pdf");
  const download = page.waitForEvent("download");
  await page.locator(".story-nav-right").getByRole("link", { name: "PDF", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("eduardo-lopez-founder-en.pdf");
  expect((await tracked).postDataJSON()).toMatchObject({ name: "download_pdf", path: "/en/v2" });
});
