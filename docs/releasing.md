# Release guide

Production deployment starts when a maintainer publishes a stable GitHub release in `loama/personal-portfolio`. Pushing a branch, opening a pull request, creating a draft release or publishing a prerelease does not deploy production. Vercel Git deployments are disabled in `vercel.json`.

## Repository setup

Use `main` as the default branch. Require the `Code and browser checks` and `Grounded model review` jobs for pull requests, with branch protection that prevents direct pushes and force pushes. Protect stable release tags from modification and deletion. Keep release publication permission limited to maintainers.

Create a GitHub environment named `production`. Restrict it to release tags matching `v*`. Add a required reviewer if publication and deployment need separate approval.

Configure these repository values through GitHub settings or a secure CLI session. Never put secret values in shell history, workflow source or committed environment files.

| Kind | Name | Value |
| --- | --- | --- |
| Secret | `AZURE_OPENAI_API_KEY` | Key for the approved Azure review resource |
| Variable | `AZURE_OPENAI_ENDPOINT` | Azure resource HTTPS endpoint, optionally ending in `/openai/v1` |
| Variable | `AZURE_OPENAI_DEPLOYMENT` | Existing model deployment with structured JSON output support |
| Secret | `VERCEL_TOKEN` | Token authorized for this Vercel project |
| Variable | `VERCEL_ORG_ID` | `team_aGAWbuKx6x5BVxlYeyS6gN1E` |
| Variable | `VERCEL_PROJECT_ID` | `prj_AW8UKS2NcyxscGlIzrLMYOYazNmg` |

The workflow passes the Vercel token through the environment. Vercel CLI 62.2.0 reads `VERCEL_TOKEN` directly. The token never appears in command arguments. The Azure key is available only to the model request step, and the Vercel token is available only to deployment configuration validation and deployment.

This guide describes required setup. It does not establish that credentials, provider billing, analytics projects or domain settings are active. Check those in their services and confirm a real result before the first release.

## Trusted model review

[GitHub Models was retired on July 30, 2026](https://docs.github.com/en/github-models/quickstart). This repository uses the [Azure OpenAI v1 structured output API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/structured-outputs?view=foundry-classic).

For a pull request, `model-review.yml` runs on `pull_request_target`, so GitHub loads the trusted base workflow. The job checks out the base commit and runs its `scripts/model-review.ts`. It fetches the proposed commit only as Git data. It does not install pull request dependencies or execute proposed scripts with a provider credential. A first setup must place the dependency free review script and parser tests, `model-review.yml` and `vercel.json` on `main` before opening the application pull request.

The workflow rejects fork pull requests before the provider credential step. They fail the required review with a message explaining the trusted branch requirement. A maintainer can inspect the contribution and create an authorized review branch in this repository. Do not add a privileged workflow that executes fork code to work around this boundary.

The model reads text source, configuration and documentation changes. It also reviews an explicit inventory for binary assets, lockfiles and generated resume exports. The inventory identifies which contents were not inspected; deterministic tests cover the resume exports. Asset only changes still make a real provider request. The script reviews changes against the pull request merge base or previous push commit. A release reviews all current eligible text files against an empty tree.

Requests reserve a combined limit of 70,000 bytes for change inventory and source patches, with at most 16 batches. An oversized file or change fails explicitly. Nothing is silently truncated. Responses must match a fixed schema, use a known severity and cite exact text at the stated file and line. Deleted source uses the original line number and old side. Inventory findings use line zero and exact inventory evidence. Incomplete responses, missing configuration and provider failures fail the check. Medium, high and critical findings block completion. Low findings remain visible in the artifact.

Model output is review data. The workflow never executes it or posts it as a pull request comment. Every completed review produces a `review.json` artifact with the commit range, reviewed files, exclusions, returned model and findings. The script never prints provider response bodies on HTTP failure.

This review can still miss defects. Unit tests, browser checks and human review remain part of the release process.

## Local validation

Use Bun 1.4.2 and put Node 24 on `PATH` for external command line tools. Use Bun for package installation and application commands.

```sh
bun install --frozen-lockfile
bun run check
bun run check:react
bun run build
git diff --exit-code -- public/resume
bunx playwright install --with-deps chromium webkit
bun run test:e2e
export CHROME_PATH="$(bun -e 'import { chromium } from "@playwright/test"; console.log(chromium.executablePath());')"
bunx --bun lhci autorun --config=lighthouserc.cjs
git diff --check
```

Inspect the complete diff for unintended files, credentials, generated output and unexpectedly large binaries. If content changed, commit the regenerated exports before running the clean export comparison.

The browser suite uses Chromium and WebKit. Lighthouse collects three mobile runs for `/en`, `/es`, `/en/work` and `/es/resume/employee`. Median scores must reach 95 for performance and 100 for accessibility, best practices and SEO. Fix failed checks before publishing. A local Lighthouse score does not prove the deployed site's PageSpeed score.

Browser evidence is retained for seven days after failed workflow runs. Lighthouse reports are retained for seven days. Structured model reviews are retained for fourteen days. Reports contain only test and public source data, not deployment environment files.

## Publish a release

1. Work on a `feat/`, `fix/` or `chore/` branch. Keep logical commits separate and use conventional commit messages.
2. Open a pull request against `main` and assign `loama`. Review the complete change and wait for both required quality jobs.
3. Merge the approved commits into `main` while preserving their logical history.
4. Create an immutable tag such as `v1.0.0` at the intended `main` commit. Write release notes that describe the behavior changed, validation and any migration.
5. Publish a GitHub release for that existing tag. Do not mark it as a draft or prerelease.
6. Wait for `Release production` to finish, then verify the live site in both languages and exercise PDF, JSON and MCP access.

The release workflow requires a tag in `vMAJOR.MINOR.PATCH` format without prerelease or build suffixes. It checks that the event is a published stable release, that the checked out commit matches the tag and event SHA, and that the commit belongs to `main`. It runs the full quality workflow again, then repeats ancestry validation before deploying.

The deployment uses pinned Vercel CLI 62.2.0, passes the verified commit through the `RELEASE_COMMIT` build environment, waits for the deployment result and requires `/api/release` to return that exact commit. It also checks the public founder resume JSON response. The Vercel project must use Node 24 and the committed Bun install and build commands. Domain and TLS configuration remain Vercel project settings.

## Analytics configuration

Set production environment values in Vercel:

```dotenv
ANALYTICS_ENABLED=true
PLAUSIBLE_DOMAIN=eduardo-lopez.com
POSTHOG_HOST=https://eu.i.posthog.com
POSTHOG_PROJECT_KEY=
```

Use the dedicated portfolio PostHog project's ingestion key for `POSTHOG_PROJECT_KEY`. Choose `https://eu.i.posthog.com` for an EU project or `https://us.i.posthog.com` for a US project. Do not reuse another product's project. This key configures event ingestion; it is not a personal API key.

Enable analytics only after the Plausible site and dedicated PostHog project exist and the deployed consent flow has been tested. After accepting consent, trigger a real page view and download, then confirm receipt in both services. Declining consent must prevent tracking. Until that verification succeeds, provider activation remains unconfirmed.

## Rollback

Revert the faulty change through a pull request to `main`, run the required checks and publish a new patch release. This preserves the release record and uses the same deployment gate. Never move or reuse an existing release tag.

For an incident that cannot wait for a corrective release, an authorized maintainer can use Vercel's manual rollback to a verified earlier production deployment. Record which deployment was restored, check the public site and follow with a corrective GitHub release. Manual incident recovery does not add an automated deployment trigger.
