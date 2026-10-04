module.exports = {
  ci: {
    collect: {
      startServerCommand: "bun --bun next start --hostname 127.0.0.1 --port 3100",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 60000,
      chromePath: process.env.CHROME_PATH,
      numberOfRuns: 3,
      url: [
        "http://127.0.0.1:3100/en/resume/founder",
        "http://127.0.0.1:3100/es/resume/founder",
        "http://127.0.0.1:3100/en/resume/employee",
        "http://127.0.0.1:3100/es/resume/employee",
      ],
      settings: { chromeFlags: "--headless --no-sandbox --disable-dev-shm-usage" },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95, aggregationMethod: "median-run" }],
        "categories:accessibility": ["error", { minScore: 1, aggregationMethod: "median-run" }],
        "categories:best-practices": ["error", { minScore: 1, aggregationMethod: "median-run" }],
        "categories:seo": ["error", { minScore: 1, aggregationMethod: "median-run" }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: process.env.LHCI_ARTIFACT_DIR || "artifacts/lighthouse",
    },
  },
};
