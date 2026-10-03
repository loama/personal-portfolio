# Eduardo López

A bilingual portfolio at [eduardo-lopez.com](https://eduardo-lopez.com), with founder and employee resumes, PDF and JSON downloads, a public resume API, and an MCP endpoint.

The app uses Next.js, React, TypeScript and Bun. Professional claims live in `content/profile.json`; `docs/content-sources.md` records their sources. English and Spanish have equal coverage. Each language has founder and employee resume exports.

## Run locally

Use Bun 1.4.2. Node 24 must also be on `PATH` for external tools such as React Doctor. The application, build and test commands use Bun.

```sh
bun install --frozen-lockfile
cp .env.example .env.local
bun run dev
```

Open [localhost:3000](http://localhost:3000). Analytics is disabled in the example configuration. See `docs/releasing.md` for production configuration.

## Validate a change

```sh
bun run check
bun run check:react
bun run build
bunx playwright install --with-deps chromium webkit
bun run test:e2e
export CHROME_PATH="$(bun -e 'import { chromium } from "@playwright/test"; console.log(chromium.executablePath());')"
bunx --bun lhci autorun --config=lighthouserc.cjs
git diff --check
```

The checks cover source validation, unit behavior, all four resume exports, browser navigation, responsive layouts, consent behavior, downloads and automated accessibility. React Doctor blocks warnings. Lighthouse requires at least 95 for mobile performance and 100 for accessibility, best practices and SEO on four representative routes, using the median of three runs. These are test thresholds, not a claim about current production PageSpeed scores.

GitHub Actions also requests a structured Azure OpenAI review. It checks every selected source diff without truncation and requires each finding to cite exact text at a reviewed line. Medium, high and critical findings block the workflow. See the release guide for credentials, coverage limits and the trusted code boundary.

## Public interfaces

| Interface | Example |
| --- | --- |
| Resume JSON | `/api/resume?lang=en&version=founder` |
| Resume PDF | `/api/resume?lang=es&version=employee&format=pdf` |
| MCP | `/mcp` |
| Agent reading guide | `/en/agents` |
| Text discovery | `/llms.txt` |

The resume API accepts `en` or `es`, and `founder` or `employee`. Invalid values return an error. The MCP endpoint exposes public professional information and requires no account.

## Releases

Pull requests target `main`. Branch pushes run quality checks. Only a published stable GitHub release triggers the automated production deployment. `vercel.json` disables deployments from Git pushes.

Read [the release guide](docs/releasing.md) before configuring credentials or publishing a release.

## Template license

The original visual template came from Tailwind UI and remains subject to the [Tailwind UI license](https://tailwindui.com/license). Publishing this repository does not grant redistribution rights to that template.
