# Contributing & release policy

This repository targets **GitHub Free** on a **public** OSS project. Do not
add features that need GitHub Team, Enterprise, Advanced Security, or other
paid GitHub products.

## Branching and merging

`main` is protected. **Nobody — human or AI agent — pushes directly to `main`.**
All changes land through pull requests:

1. Create a feature branch. Run `npm run verify` before you push — it is lint +
   knip + tests + build + packaging smoke test, and it is the same command the
   `quality` job runs, so it cannot drift from CI.
2. Open a PR against `main` using [Conventional Commits](https://www.conventionalcommits.org/)
   (`feat:`, `fix:`, `chore:`, …) — release-please derives the version bump and
   changelog from them.
3. CI (`.github/workflows/ci.yml`) must pass: a `quality` job (`npm run verify`,
   plus the network-dependent checks `npm audit`, `npm audit signatures` and
   `@arethetypeswrong/cli`), a `test` job across Node 22/24/26, and a
   `workflows` job (zizmor, no GitHub code scanning).
4. A **human** reviews and merges. Merging is the human authorization step.

### Rules enforced on `main` (branch protection — free on public repos)

- Require a pull request before merging.
- Require these status checks, named exactly: `quality`, `test (22)`,
  `test (24)`, `test (26)`, `workflows`. **The matrix leg names are part of the
  check names**, so changing the Node matrix in `ci.yml` without updating this
  list leaves a required check that can never report and blocks every PR.
- Everything runs on Node >= 22: tsdown's CLI requires `^22.18 || ^24.11 || >=26`
  and the tests rely on native TypeScript type stripping (22.18+). Node 20 is
  end-of-life, so it is neither supported nor tested. The matrix covers 22
  (maintenance LTS), 24 (active LTS) and 26 (current); `.nvmrc`, the `quality`
  job and the publish job all use 24. `package.json#devEngines` makes `npm ci`
  fail outright on anything below 22.18.
- Block force pushes and branch deletion.

Do not enable paid-only rules (merge queues, org rulesets beyond Free public,
GitHub Advanced Security, required code-owner reviews if your plan doesn't
include them). `CODEOWNERS` is advisory unless you turn that rule on.

### AI agents

Follow `AGENTS.md`. Agents may push a feature branch and open a PR. They must
not push `main`, merge, publish a GitHub Release, or publish the package.

`npm ci` installs a `pre-push` hook that refuses `main`. That hook is UX, not
the boundary: `--no-verify` skips it. Run agents under a credential with **no
merge/admin rights**, and enable "Do not allow bypassing the above settings"
(`enforce_admins`) on `main`. Without that, an agent on the owner's token still
reaches `main`.

## Versioning & release (release-please)

Versioning is automated from Conventional Commits:

1. On every push to `main`, **release-please** opens/updates a **release PR** that
   bumps `package.json` and updates `CHANGELOG.md`.
2. The same workflow refreshes `CODES.md` from `GET /rates/BTC` on that PR, on
   every push to `main` while the PR is open (release-please force-pushes its
   branch, so re-running is what makes the refresh survive).
3. A maintainer reviews and merges the release PR.
4. Merging creates a **draft GitHub Release** with auto-generated notes.
5. A maintainer reviews the draft and clicks **Publish release**. This is the
   deploy authorization (and the only required human gate).

## Dependency install scripts

**No package in the tree runs code at install time.** `.npmrc` sets
`strict-allow-scripts=true`, so the first dependency that gains an install
script **fails** `npm ci` instead of running. Review it, then add a pinned
entry to `package.json#allowScripts`. Keeping that list empty is the goal.

CI additionally runs `npm audit signatures`, which checks every installed
package against the registry's signature.

The `update-codes` job in `release-please.yml` holds a `contents: write` token,
so it deliberately installs nothing and restores no cache — the script runs on
plain Node.

## Deploy to npm

Publishing the release fires `npm-publish.yml`:

1. The job runs in the **`npm-publish` environment** so npm Trusted Publishing
   can bind to this workflow. Extra environment protection rules (required
   reviewers, wait timers) are optional — they work on public GitHub Free but
   are not required; the draft-release publish is the gate.
2. It runs `npm ci`, verifies the release tag matches `package.json`, and runs
   `npm publish --provenance`. `prepublishOnly` rebuilds `dist/` and re-runs the
   packaging smoke test, so a broken artifact cannot reach npm.
3. Authentication uses **npm Trusted Publishing (OIDC)** — there is no
   long-lived npm token. Provenance attestation is attached automatically.

The published tarball is **only `dist/`** (plus npm's always-included
`package.json`, `README.md`, and `LICENSE`). Keep it that way.

## One-time setup (repository settings, not in the repo)

All of this is available on GitHub Free for a public repository.

Already configured:

- **Merges are squash-only**, so the PR title is the commit release-please
  reads, and the branch is deleted on merge.
- **Default `GITHUB_TOKEN` permissions are read-only** and Actions cannot
  approve pull requests. Each workflow raises its own `permissions:` where it
  genuinely needs to write.
- **Private vulnerability reporting**, **secret scanning** and **push
  protection** are on. Dependabot alerts and security updates are on.
- **Environment `npm-publish`** with required reviewers, so the Trusted
  Publisher can name it and the deploy has a second human gate.
- **No repository secrets today.** Publishing uses OIDC, so there is no
  `NPM_TOKEN`. The only secret this repo can ever need is
  `RELEASE_PLEASE_APP_PRIVATE_KEY` (or `RELEASE_PLEASE_TOKEN`), and only if you
  enable the optional release-please App or PAT described below.

Still to keep in mind:

- **Branch protection on `main`**: require a PR, require the five checks listed
  above, block force pushes and deletions. Update the list whenever the Node
  matrix changes.
- **npm Trusted Publisher**: on npmjs.com → package → Settings → Trusted
  Publisher, add this GitHub repo + the `npm-publish.yml` workflow. Without it
  the publish job cannot authenticate — there is no token fallback.
- **Release-please token** (optional but recommended), so the release PR
  triggers CI — without it the PR is bot-authored and CI is suppressed on it.
  The workflow picks the first available, in order:
  1. **GitHub App (free):** create an App with `Contents: RW` and
     `Pull requests: RW`, install it on this repo, then set the repo
     **variable** `RELEASE_PLEASE_APP_CLIENT_ID` (the App's Client ID, not
     the numeric App ID) and the **secret** `RELEASE_PLEASE_APP_PRIVATE_KEY`.
  2. **PAT fallback:** a fine-grained PAT with `contents: write` +
     `pull_requests: write`, stored as the secret `RELEASE_PLEASE_TOKEN`.
  3. **Nothing configured:** falls back to `GITHUB_TOKEN` (CI won't run on the
     release PR).
