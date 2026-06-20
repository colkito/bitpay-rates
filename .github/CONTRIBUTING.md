# Contributing & release policy

## Branching and merging

`main` is protected. **Nobody — human or AI agent — pushes directly to `main`.**
All changes land through pull requests:

1. Create a feature branch.
2. Open a PR against `main` using [Conventional Commits](https://www.conventionalcommits.org/)
   (`feat:`, `fix:`, `chore:`, …) — release-please derives the version bump and
   changelog from them.
3. CI (`.github/workflows/ci.yml`) must pass: a `quality` job (lint + build) and a
   `test` job across Node 20/22/24.
4. A **human** reviews and merges. Merging is the human authorization step.

### Rules enforced on `main` (branch protection / ruleset)

- Require a pull request before merging.
- Require the `quality` and `test` status checks to pass.
- Block force pushes and branch deletion.

### AI agents

Agents may **only open pull requests**. They must not:

- push to `main`,
- merge pull requests,
- publish (i.e. mark as published) GitHub Releases.

The backstop is operational: run agents under a credential with **no merge/admin
rights** (a bot account or fine-grained token limited to `contents: write` on
branches + `pull_requests: write`). Branch protection and the draft-release +
environment approval gates ensure that even a misconfigured agent cannot ship
code or publish a package on its own.

## Versioning & release (release-please)

Versioning is automated from Conventional Commits:

1. On every push to `main`, **release-please** opens/updates a **release PR** that
   bumps `package.json` and updates `CHANGELOG.md`.
2. A maintainer reviews and merges the release PR.
3. Merging creates a **draft GitHub Release** with auto-generated notes.
4. A maintainer reviews the draft and clicks **Publish release**. This is the
   deploy authorization.

## Deploy to npm

Publishing the release fires `npm-publish.yml`:

1. The job runs in the **`npm-publish` environment** (required reviewer) — a
   second human gate before anything reaches npm.
2. It runs `npm ci`, verifies the release tag matches `package.json`, and runs
   `npm publish --provenance`.
3. Authentication uses **npm Trusted Publishing (OIDC)** — there is no
   long-lived npm token. Provenance attestation is attached automatically.

## One-time setup (repository settings, not in the repo)

- **Branch protection / ruleset on `main`**: require a PR, require the `quality`
  and `test` checks, block force pushes and deletions.
- **Environment `npm-publish`** with a **required reviewer**.
- **npm Trusted Publisher**: on npmjs.com → package → Settings → Trusted
  Publisher, add this GitHub repo + the `npm-publish.yml` workflow. No
  `NPM_TOKEN` secret is needed once this is configured.
- **`RELEASE_PLEASE_TOKEN`** (optional but recommended): a fine-grained PAT or
  GitHub App token with `contents: write` + `pull_requests: write`, so the
  release PR triggers CI. Without it, the release PR is bot-authored and CI is
  suppressed on it.
