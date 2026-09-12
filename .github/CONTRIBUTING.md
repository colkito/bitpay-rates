# Contributing & release policy

This repository targets **GitHub Free** on a **public** OSS project. Do not
add features that need GitHub Team, Enterprise, Advanced Security, or other
paid GitHub products.

## Branching and merging

`main` is protected. **Nobody — human or AI agent — pushes directly to `main`.**
All changes land through pull requests:

1. Create a feature branch.
2. Open a PR against `main` using [Conventional Commits](https://www.conventionalcommits.org/)
   (`feat:`, `fix:`, `chore:`, …) — release-please derives the version bump and
   changelog from them.
3. CI (`.github/workflows/ci.yml`) must pass: a `quality` job (lint + knip +
   build + `npm audit`), a `test` job across Node 20/22/24, and a `workflows`
   job (zizmor, no GitHub code scanning).
4. A **human** reviews and merges. Merging is the human authorization step.

Agents: follow `AGENTS.md`. Never push `main`, merge, publish a GitHub Release,
or run `npm publish`.

### Rules enforced on `main` (branch protection — free on public repos)

- Require a pull request before merging.
- Require the `quality`, `test`, and `workflows` status checks to pass.
- `quality` runs on Node 22 because tsdown's CLI requires Node `^22.18 || ^24.11 || >=26`. Consumers still need only Node >= 20.
- Block force pushes and branch deletion.

Do not enable paid-only rules (merge queues, org rulesets beyond Free public,
GitHub Advanced Security, required code-owner reviews if your plan doesn't
include them). `CODEOWNERS` is advisory unless you turn that rule on.

### AI agents

Agents may **only open pull requests**. They must not:

- push to `main`,
- merge pull requests,
- publish (i.e. mark as published) GitHub Releases.

The backstop is operational: run agents under a credential with **no merge/admin
rights**. Branch protection and the draft-release gate ensure that even a
misconfigured agent cannot ship code or publish a package on its own.

## Versioning & release (release-please)

Versioning is automated from Conventional Commits:

1. On every push to `main`, **release-please** opens/updates a **release PR** that
   bumps `package.json` and updates `CHANGELOG.md`.
2. The same workflow refreshes `CODES.md` from `GET /rates/BTC` on that PR.
3. A maintainer reviews and merges the release PR.
4. Merging creates a **draft GitHub Release** with auto-generated notes.
5. A maintainer reviews the draft and clicks **Publish release**. This is the
   deploy authorization (and the only required human gate).

## Deploy to npm

Publishing the release fires `npm-publish.yml`:

1. The job runs in the **`npm-publish` environment** so npm Trusted Publishing
   can bind to this workflow. Extra environment protection rules (required
   reviewers, wait timers) are optional — they work on public GitHub Free but
   are not required; the draft-release publish is the gate.
2. It runs `npm ci`, verifies the release tag matches `package.json`, and runs
   `npm publish --provenance`.
3. Authentication uses **npm Trusted Publishing (OIDC)** — there is no
   long-lived npm token. Provenance attestation is attached automatically.

The published tarball is **only `dist/`** (plus npm's always-included
`package.json`, `README.md`, and `LICENSE`). Keep it that way.

## One-time setup (repository settings, not in the repo)

All of this is available on GitHub Free for a public repository:

- **Branch protection on `main`**: require a PR, require the `quality`,
  `test`, and `workflows` checks, block force pushes and deletions.
- **Environment `npm-publish`** (no paid protection rules required) so the
  Trusted Publisher can name it.
- **npm Trusted Publisher**: on npmjs.com → package → Settings → Trusted
  Publisher, add this GitHub repo + the `npm-publish.yml` workflow. No
  `NPM_TOKEN` secret is needed once this is configured.
- **Release-please token** (optional but recommended), so the release PR
  triggers CI — without it the PR is bot-authored and CI is suppressed on it.
  The workflow picks the first available, in order:
  1. **GitHub App (free):** create an App with `Contents: RW` and
     `Pull requests: RW`, install it on this repo, then set the repo
     **variable** `RELEASE_PLEASE_APP_ID` and the **secret**
     `RELEASE_PLEASE_APP_PRIVATE_KEY`.
  2. **PAT fallback:** a fine-grained PAT with `contents: write` +
     `pull_requests: write`, stored as the secret `RELEASE_PLEASE_TOKEN`.
  3. **Nothing configured:** falls back to `GITHUB_TOKEN` (CI won't run on the
     release PR).
