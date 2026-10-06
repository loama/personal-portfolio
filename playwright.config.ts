import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

const qaDir = process.env.QA_ARTIFACT_DIR ?? join(tmpdir(), "eduardo-portfolio-qa");
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100";
export default defineConfig({
  outputDir: join(qaDir, "results"),
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 2,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: join(qaDir, "report") }]],
  use: {
    baseURL,
    // DOM snapshots inject scripts into the previews. Keep their sandbox intact.
    trace: { mode: "retain-on-failure", snapshots: false, screenshots: true, sources: true },
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: "bun --bun next start --hostname localhost --port 3100",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
