import { test, expect } from "@playwright/test";
import sharp from "sharp";

test("live previews load only when their cards approach the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const requests = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/project-preview/")) requests.push(request.url());
  });
  await page.goto("/en/resume/employee");
  await page.getByTitle("Dark", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "Dark", exact: true })).toBeChecked();
  expect(requests).toEqual([]);
  const link = page.getByRole("link", { name: "Visit Supervisor", exact: true });
  await expect(link.locator("iframe")).not.toHaveAttribute("src");
  await link.scrollIntoViewIfNeeded();
  await expect(link.locator("iframe")).toHaveAttribute("src", "/api/project-preview/supervisor");
  await expect.poll(() => requests.some((url) => url.endsWith("/api/project-preview/supervisor"))).toBe(true);
});

test("project previews display the current websites and remain linked at phone and desktop sizes", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/en/resume/founder");
  const previews = page.locator("#work iframe");
  await expect(previews).toHaveCount(2);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const project of [
      { name: "Supervisor", url: "https://trysupervisor.com" },
      { name: "Constructor", url: "https://useconstructor.com" },
    ]) {
      const link = page.getByRole("link", { name: `Visit ${project.name}`, exact: true });
      await link.scrollIntoViewIfNeeded();
      await expect(link).toHaveAttribute("href", project.url);
      const preview = link.locator("iframe");
      await expect(preview).toHaveAttribute("src", `/api/project-preview/${project.name.toLowerCase()}`);
      await expect(preview).toHaveAttribute("tabindex", "-1");
      await expect(preview).toHaveAttribute("sandbox", "");
      const content = page.frameLocator(`iframe[title="${project.name} website preview"]`);
      if (project.name === "Supervisor") {
        await expect(content.getByRole("link", { name: "Supervisor home", exact: true }).first()).toBeVisible({ timeout: 15000 });
      } else {
        await expect(content.getByRole("heading", { name: "Build software from a sentence.", exact: true })).toBeVisible({ timeout: 15000 });
      }
      const bounds = await preview.boundingBox();
      const container = await link.boundingBox();
      expect(bounds.width).toBeLessThanOrEqual(container.width);
      expect(bounds.height).toBeLessThanOrEqual(container.height);
      expect(await preview.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe("none");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("website screenshots remain visible when external pages cannot load", async ({ page }) => {
  for (const url of ["**/api/project-preview/supervisor", "**/api/project-preview/constructor"]) {
    await page.route(url, (route) => route.fulfill({ status: 204 }));
  }
  await page.goto("/en/resume/founder");
  await page.getByRole("button", { name: "Decline", exact: true }).click();
  for (const name of ["Supervisor", "Constructor"]) {
    const preview = page.getByRole("link", { name: `Visit ${name}`, exact: true });
    await preview.scrollIntoViewIfNeeded();
    await expect.poll(() => preview.locator("img").evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    const pixels = await sharp(await preview.locator("div").screenshot()).stats();
    expect(pixels.channels.slice(0, 3).every((channel) => channel.stdev > 20)).toBe(true);
  }
});

test("preview responses block scripts and reject arbitrary sources", async ({ request }) => {
  for (const project of ["supervisor", "constructor"]) {
    const response = await request.get(`/api/project-preview/${project}`);
    expect(response.status()).toBe(200);
    expect(response.headers()["x-preview-state"]).toBe("live");
    expect(response.headers()["content-security-policy"]).toContain("script-src 'none'");
    expect(response.headers()["content-security-policy"]).toContain("sandbox");
    expect(response.headers()["x-robots-tag"]).toBe("noindex");
    const html = await response.text();
    expect(html).not.toMatch(/<script\b|\son(?:click|load|error)=|<iframe\b/i);
    expect(html).toContain(project === "supervisor" ? "Supervisor home" : "Build software");
  }
  expect((await request.get("/api/project-preview/unknown")).status()).toBe(404);
});
