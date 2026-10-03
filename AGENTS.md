# Project workflow

Use Bun for installation, scripts, tests, and builds.

The default branch is `main`. Create work on `feat/`, `fix/`, or `chore/` branches. Open pull requests against `main`. Preserve logical commits when merging. The production branch is a published GitHub release tag, never a branch push.

Run `bun run check`, `bun run build`, `bun run test:e2e`, and `bun run check:react` before releasing. Inspect the complete diff and run `git diff --check`. Never suppress failures to meet a score.

Use conventional commits. Keep source data, API logic, tests, interface, automation, and documentation in separate logical commits. Assign pull requests to `loama`.

Keep professional claims in `content/profile.json`. Every substantive claim must have evidence in `docs/content-sources.md`. Do not publish private source documents. Never infer revenue, customer counts, exits, or individual impact from a company name.

English and Spanish are equal outputs. Generate all four PDF and JSON variants after content changes. Preserve the public API contract and test invalid input.

Write prose without dash characters. Apply the available unslop skill before saving prose. Technical identifiers, URLs, paths, flags, and external names retain their literal spelling.
