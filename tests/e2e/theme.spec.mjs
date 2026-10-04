import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ colorScheme: "light" });

async function background(page) {
  return page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d");
    context.fillStyle = getComputedStyle(document.body).backgroundColor;
    context.fillRect(0, 0, 1, 1);
    return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
  });
}

async function expectAppearance(page, appearance) {
  await expect.poll(() => background(page)).toEqual(appearance === "dark" ? [21, 21, 21] : [255, 255, 255]);
}

test("appearance selection slides to each choice and respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/en/resume/founder");
  const control = page.getByRole("group", { name: "Appearance", exact: true });
  const indicator = () => control.evaluate((element) => {
    const style = getComputedStyle(element, "::before");
    const matrix = new DOMMatrixReadOnly(style.transform);
    return { x: matrix.m41, width: parseFloat(style.width), duration: style.transitionDuration, property: style.transitionProperty };
  });
  await page.getByTitle("Device", { exact: true }).click();
  await expect.poll(async () => (await indicator()).x).toBe(0);
  for (const [label, index] of [["Light", 1], ["Dark", 2], ["Device", 0]]) {
    await page.getByTitle(label, { exact: true }).click();
    await expect(control.getByRole("radio", { name: label, exact: true })).toBeChecked();
    await expect.poll(async () => {
      const state = await indicator();
      return Math.abs(state.x - state.width * index);
    }).toBeLessThan(0.1);
    const state = await indicator();
    expect(state.property).toContain("transform");
    expect(parseFloat(state.duration)).toBeGreaterThan(0);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByTitle("Dark", { exact: true }).click();
  const reduced = await indicator();
  expect(reduced.duration).toBe("0s");
  expect(Math.abs(reduced.x - reduced.width * 2)).toBeLessThan(0.1);
  await expectAppearance(page, "dark");
});

test("a stored theme applies before application scripts load", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("portfolio_theme", "dark"));
  let releaseScripts;
  const scriptsReleased = new Promise((resolve) => { releaseScripts = resolve; });
  await page.route("**/_next/static/**/*.js", async (route) => {
    await scriptsReleased;
    await route.continue();
  });
  try {
    await page.goto("/en/resume/founder", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectAppearance(page, "dark");
  } finally {
    releaseScripts();
  }
  await page.waitForLoadState("load");
  await expect(page.getByRole("radio", { name: "Dark", exact: true })).toBeChecked();
  await expectAppearance(page, "dark");
});

test("theme choices persist through navigation, language changes and reload", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/en/resume/founder");
  await page.getByRole("button", { name: "Decline", exact: true }).click();
  await page.getByTitle("Dark", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "Dark", exact: true })).toBeChecked();
  await expectAppearance(page, "dark");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("portfolio_theme"))).toBe("dark");
  await page.getByRole("link", { name: "Employee & consultant", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/resume\/employee$/);
  await expectAppearance(page, "dark");
  await page.getByRole("navigation", { name: "Language", exact: true }).getByRole("link", { name: "ES", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/resume\/employee$/);
  await expect(page.getByRole("radio", { name: "Oscuro", exact: true })).toBeChecked();
  await expectAppearance(page, "dark");
  await page.reload();
  await expectAppearance(page, "dark");
  await expect(page.getByRole("radio", { name: "Oscuro", exact: true })).toBeChecked();
  await page.getByTitle("Claro", { exact: true }).click();
  await expectAppearance(page, "light");
  await page.reload();
  await expectAppearance(page, "light");
  expect(errors).toEqual([]);
});

test("device appearance follows live system changes and explicit choices override it", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/en/resume/employee");
  await expect(page.getByRole("radio", { name: "Device", exact: true })).toBeChecked();
  await expectAppearance(page, "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expectAppearance(page, "light");
  await page.getByTitle("Dark", { exact: true }).click();
  await expectAppearance(page, "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expectAppearance(page, "dark");
  await page.getByTitle("Device", { exact: true }).click();
  await expectAppearance(page, "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expectAppearance(page, "dark");
  const accessibility = await new AxeBuilder({ page }).include("header").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
});

test("appearance uses native radio keyboard controls in both languages", async ({ page }) => {
  for (const copy of [{ locale: "en", group: "Appearance", device: "Device", light: "Light", dark: "Dark" }, { locale: "es", group: "Apariencia", device: "Dispositivo", light: "Claro", dark: "Oscuro" }]) {
    await page.goto(`/${copy.locale}/resume/founder`);
    const control = page.getByRole("group", { name: copy.group, exact: true });
    await expect(control.getByRole("radio")).toHaveCount(3);
    await control.getByRole("radio", { name: copy.device, exact: true }).press("Space");
    await control.getByRole("radio", { name: copy.device, exact: true }).press("ArrowRight");
    await expect(control.getByRole("radio", { name: copy.light, exact: true })).toBeChecked();
    await control.getByRole("radio", { name: copy.light, exact: true }).press("ArrowRight");
    await expect(control.getByRole("radio", { name: copy.dark, exact: true })).toBeChecked();
    await expectAppearance(page, "dark");
    await control.getByRole("radio", { name: copy.dark, exact: true }).press("ArrowLeft");
    await expect(control.getByRole("radio", { name: copy.light, exact: true })).toBeChecked();
    await control.getByRole("radio", { name: copy.light, exact: true }).press("ArrowLeft");
    await expect(control.getByRole("radio", { name: copy.device, exact: true })).toBeChecked();
    await expectAppearance(page, "light");
  }
});

test("theme changes synchronize between open tabs and reset when preference is cleared", async ({ page, context }) => {
  await page.goto("/en/resume/founder");
  const other = await context.newPage();
  try {
    await other.goto("/en/resume/employee");
    await page.getByTitle("Dark", { exact: true }).click();
    await expectAppearance(other, "dark");
    await expect(other.getByRole("radio", { name: "Dark", exact: true })).toBeChecked();
    await other.getByTitle("Light", { exact: true }).click();
    await expectAppearance(page, "light");
    await expect(page.getByRole("radio", { name: "Light", exact: true })).toBeChecked();
    await other.evaluate(() => localStorage.removeItem("portfolio_theme"));
    await expect(page.getByRole("radio", { name: "Device", exact: true })).toBeChecked();
    await expectAppearance(page, "light");
  } finally {
    await other.close();
  }
});

test("appearance stays usable when browser storage is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Storage unavailable", "SecurityError"); } });
  });
  await page.goto("/en/resume/founder");
  await page.getByTitle("Dark", { exact: true }).click();
  await expectAppearance(page, "dark");
  await expect(page.getByRole("radio", { name: "Dark", exact: true })).toBeChecked();
  await page.getByRole("link", { name: "Employee & consultant", exact: true }).click();
  await expectAppearance(page, "dark");
  await page.getByRole("navigation", { name: "Language", exact: true }).getByRole("link", { name: "ES", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/resume\/employee$/);
  await expectAppearance(page, "dark");
  await page.getByTitle("Claro", { exact: true }).click();
  await expectAppearance(page, "light");
});

test("both themes remain accessible and fit phone and desktop resumes", async ({ page }, testInfo) => {
  for (const { locale, version, light, dark } of [{ locale: "en", version: "founder", light: "Light", dark: "Dark" }, { locale: "es", version: "employee", light: "Claro", dark: "Oscuro" }]) {
    await page.goto(`/${locale}/resume/${version}`);
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      for (const appearance of [{ label: light, value: "light" }, { label: dark, value: "dark" }]) {
        await page.getByTitle(appearance.label, { exact: true }).click();
        await expectAppearance(page, appearance.value);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        expect(result.violations, JSON.stringify(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })))).toEqual([]);
        if (testInfo.project.name === "chromium" && appearance.value === "dark" && width === (version === "founder" ? 1440 : 320)) {
          await page.screenshot({ path: join(process.env.QA_ARTIFACT_DIR ?? join(tmpdir(), "eduardo-portfolio-qa"), `theme-${version}-dark.png`), fullPage: true, animations: "disabled" });
        }
      }
    }
  }
});
