# Contributing & release policy

## Branching and merging

`main` is protected. **Nobody — human or AI agent — pushes directly to `main`.**
All changes land through pull requests:

1. Create a feature branch.
2. Open a PR against `main`.
3. CI (`.github/workflows/ci.yml`) must pass: lint, tests, and build on Node 18/20/22.
4. A **human** reviews and merges. Merging is the human authorization step.

### Rules enforced on `main` (branch protection / ruleset)

- Require a pull request before merging.
- Require the `CI` status checks to pass.
- Require at least one approving review.
- Block force pushes and branch deletion.

### AI agents

Agents may **only open pull requests**. They must not:

- push to `main`,
- merge pull requests,
- create GitHub Releases (a release triggers a deploy).

The backstop for this is operational: run agents under a credential that has
**no merge/admin rights** (a bot account or fine-grained token limited to
`contents: write` on branches + `pull_requests: write`). Branch protection and
the deploy approval gate below ensure that even a misconfigured agent cannot
ship code or publish a package on its own.

## Release / deploy to npm

Publishing is driven by GitHub Releases and gated by a human:

1. Bump the version in `package.json` (via a PR) following semver.
2. After the PR is merged, a maintainer creates a **GitHub Release** whose tag
   matches the new version (e.g. `v3.0.0`).
3. The `Publish Node.js Package` workflow runs in the **`npm-publish`
   environment**, which has a **required reviewer**. The publish pauses until a
   human approves the deployment.
4. On approval, the workflow runs `npm ci`, lint, tests, build, verifies the tag
   matches `package.json`, and runs `npm publish --provenance`.

### One-time GitHub setup

These live in repository settings (not in the repo) and must be configured once:

- **Branch protection / ruleset on `main`** with the rules listed above.
- **Environment `npm-publish`** with at least one **required reviewer** and,
  ideally, "prevent self-review" enabled.
- **Secret `NPM_TOKEN`** (an npm automation token) available to the
  `npm-publish` environment.
