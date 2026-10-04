type ReleaseCheck = {
  url: string;
  commit: string;
  timeoutMs?: number;
  intervalMs?: number;
};

export async function waitForRelease({ url, commit, timeoutMs = 180_000, intervalMs = 5_000 }: ReleaseCheck) {
  const deadline = Date.now() + timeoutMs;
  let lastResponse = "No response received.";
  let lastFailure = "";
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(Math.max(1, Math.min(10_000, deadline - Date.now()))),
      });
      lastResponse = `HTTP ${response.status}.`;
      lastFailure = "";
      if (response.ok) {
        const release = await response.json();
        if (release?.commit === commit) return;
        lastResponse = "The response did not contain the expected commit.";
      }
    } catch {
      lastFailure = "The request failed or returned invalid release metadata.";
    }
    const remaining = deadline - Date.now();
    if (remaining > 0) await Bun.sleep(Math.min(intervalMs, remaining));
  }
  throw new Error(`Production did not report commit ${commit} within ${timeoutMs} ms. ${[lastResponse, lastFailure].filter(Boolean).join(" ")}`);
}

if (import.meta.main) {
  const commit = process.env.GITHUB_SHA;
  if (!commit || !/^[a-f0-9]{40}$/.test(commit)) throw new Error("A release commit is required.");
  await waitForRelease({ url: "https://eduardo-lopez.com/api/release", commit });
  console.log("Production commit matches the published release.");
}
