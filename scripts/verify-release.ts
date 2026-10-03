import { readFile } from "node:fs/promises";

export function validReleaseTag(value: string): boolean {
  return value.trim() === value && /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value);
}

function git(...args: string[]) {
  const result = Bun.spawnSync(["git", ...args], { stdout: "pipe", stderr: "pipe", env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } });
  if (result.exitCode !== 0) throw new Error("Release ancestry validation failed.");
  return result.stdout.toString().trim();
}

async function run() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || process.env.GITHUB_EVENT_NAME !== "release") throw new Error("Production deployment requires a GitHub release event.");
  const event = JSON.parse(await readFile(eventPath, "utf8"));
  const release = event.release;
  if (event.action !== "published" || !release || release.draft !== false || release.prerelease !== false || typeof release.tag_name !== "string" || !validReleaseTag(release.tag_name)) {
    throw new Error("Publish a stable semantic version release to deploy production.");
  }
  const commit = git("rev-parse", "--verify", `refs/tags/${release.tag_name}^{commit}`);
  if (commit !== process.env.GITHUB_SHA || commit !== git("rev-parse", "HEAD")) throw new Error("The checked out commit does not match the published release.");
  git("fetch", "--no-tags", "origin", "refs/heads/main:refs/remotes/origin/main");
  git("merge-base", "--is-ancestor", commit, "refs/remotes/origin/main");
  console.log(`Verified published release ${release.tag_name} at ${commit}.`);
}

if (import.meta.main) {
  run().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Release verification failed.");
    process.exitCode = 1;
  });
}
