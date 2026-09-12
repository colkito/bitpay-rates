# Agent guide

bitpay-rates is a lightweight, **zero-runtime-dependency** Node.js wrapper for
the BitPay exchange rates API. It exposes one promise-based function.

This file is the source of truth for coding agents. `CLAUDE.md` and
`.github/copilot-instructions.md` point here.

## Requirements

Node **>= 22.18** for development — the build (tsdown) and the tests (native
TypeScript type stripping) both need it. `package.json#devEngines` enforces it,
so `npm ci` fails with `EBADDEVENGINES` on anything older instead of failing
later in a confusing way. `.nvmrc` pins **24** (active LTS), which is also what
the CI quality job and the publish job use.

Consumers of the published package need Node >= 22 (`package.json#engines`).
The test matrix covers 22 (maintenance LTS), 24 (active LTS) and 26 (current).

Keep `@types/node` on the **22.x** line: it must describe the oldest Node this
package supports, not the newest one we develop on.

## Commands

**Before opening a PR, run `npm run verify`.** It is lint + knip + tests +
build + packaging smoke test, and it is literally the command CI runs. The
`quality` job adds two checks that need network and therefore do not belong in
the inner loop: `npm audit` and `@arethetypeswrong/cli`.

- **Test**: `npm test`
- **Test watch**: `npm run test:watch`
- **Coverage**: `npm run test:coverage`
- **Single test**: `node --test --test-name-pattern "<name>" src/index.test.mts`
- **Lint** (types + Biome): `npm run lint`
- **Format**: `npm run format`
- **Dead-code check**: `npm run knip`
- **Build**: `npm run build`
- **Packaging check**: `npm run smoke` (needs a build first)
- **Refresh CODES.md**: `npm run update-codes` (hits the live BitPay API).
  Release-please owns this file: it runs on the release PR. Do not run it on a
  feature PR and do not hand-edit CODES.md.
- **Type check only**: `tsc --noEmit`

Do not edit `dist/` or `package-lock.json` by hand; run `npm ci`.

**Adding a dependency needs human approval.** `npm install` is deliberately not
pre-approved: propose the package and the reason in the PR first, then install
it with `npm install --save-exact --save-dev <pkg>@<version>`.

`prepare` ends in `|| true` on purpose: lefthook exits 1 without a `.git`
directory, which would otherwise break `npm ci` in a checkout with no git
history.

## Architecture

Single module: `src/index.mts`. Sources are `.mts` so Node can run them
directly — there is no TypeScript runner in the dependency tree.

```ts
get(): Promise<RateObj[]>
get(query: { base?: string; quote?: undefined }): Promise<RateObj[]>
get(query: { base?: string; quote: string }): Promise<RateObj>
```

One named argument object, deliberately — there is no parameter order to get
wrong. The third overload's `quote?: undefined` is **load-bearing**: without it
TypeScript resolves `get(someVariable)` to the array overload and the declared
return type lies.

`get` is the named export; the default export is a namespace object `{ get }`,
so `import bitpayRates` / `require(...)` + `bitpayRates.get()` keeps working.
**Do not change either export shape** — `scripts/smoke.mts` asserts all four
import styles against `dist/` in CI and before every publish.

- `get()` → `GET /rates/BTC` → every rate vs BTC
- `get({ base: 'ETH' })` → `GET /rates/ETH` → every rate vs ETH
- `get({ quote: 'USD' })` → `GET /rates/BTC/USD` → one rate
- `get({ base: 'ETH', quote: 'USD' })` → `GET /rates/ETH/USD` → one rate

Always send `X-Accept-Version: 2.0.0`, `Accept: application/json` and
`User-Agent: bitpay-rates`. Unwrap `{ data }`. Reject on `{ error }`, non-2xx,
malformed JSON, or a 10s timeout (`AbortController` + `setTimeout`).

`base` and `quote` are uppercased and must match `/^[A-Z0-9]{2,10}$/`; anything
else rejects with a `TypeError` before a request is made, so caller input can
never steer the URL to another path on bitpay.com. The 18 codes containing `_`
(`USDC_arb`, `MATIC_e`, …) are listed by `/rates/BTC` but BitPay rejects them
as a base or quote, so the pattern costs nothing.

`GET /rates/{code}` is polymorphic — `/rates/BTC` is a list, `/rates/USD` is a
single BTC/USD rate. The response shape is therefore checked against what was
asked for, so the declared return type cannot lie.

`Promise.race` subscribes to both promises, so the aborted fetch's later
rejection is handled and discarded. Verified: it produces no unhandled
rejection. Do not "fix" it.

Uses native `fetch`. No runtime dependencies.

### Types

- `RateObj` — `{ code: string; name: string; rate: number }`
- `RateResponse` — `RateObj | RateObj[]`

Official docs: https://developer.bitpay.com/reference/rates
Public page: https://www.bitpay.com/exchange-rates

## Tooling

- **Lint + format**: Biome (`biome.json`)
- **Tests**: Node's built-in `node:test`, run by `node --test` with no
  transpiler. Mock `globalThis.fetch`. Reset with `mock.reset()` — `restoreAll()`
  leaves fake timers enabled and hangs the next test. Never hit the live API.
- **Build**: tsdown → minified `dist/index.mjs` (ESM) + `dist/index.cjs` (CJS)
  plus matching `.d.mts` / `.d.cts`. Wired through `exports` in `package.json`.
  The npm tarball is **only `dist/`** (plus README/LICENSE/package.json). Do not
  add files to `package.json#files`.
- **Hooks**: lefthook (`lefthook.yml`) — Biome on staged files, Conventional
  Commits on `commit-msg`.
- **Dead code**: knip
- **Types across resolvers**: CI runs `@arethetypeswrong/cli` against the packed
  tarball. It is not a devDependency (it would add 56 packages) and is not part
  of `verify`, so run it by hand if you touch `exports`, `main` or `types`:
  `npx --yes @arethetypeswrong/cli@0.18.5 --pack .`
- **Packaging**: `scripts/smoke.mts` loads `dist/` through both entry points and
  asserts every documented import style. Type checks and unit tests only see
  `src/`, so this is the only thing that catches a broken `exports` map or
  default-export shape. It runs in CI after the build and from
  `prepublishOnly`.
- **Install scripts**: `package.json#allowScripts` is the reviewed allowlist and
  `.npmrc` sets `strict-allow-scripts=true`, so an unreviewed install script
  fails `npm ci` instead of running. Adding one is a deliberate, reviewed act.

## Policy

`main` is protected. Agents may **only open pull requests**. Do not:

- push to `main`
- merge pull requests
- publish GitHub Releases
- run `npm publish`

These are declared in `.claude/settings.json`, but the real enforcement is
operational and does not depend on an agent behaving: branch protection, a
credential without merge rights, and a release that only ships when a human
publishes the draft GitHub Release.

Three guardrails fail loudly rather than silently when something drifts, so do
not work around them — fix the cause and say so in the PR:

- `npm ci` fails with `EBADDEVENGINES` on Node < 22.18 (`devEngines`).
- `npm ci` fails when a dependency gains an install script that is not reviewed
  in `allowScripts` (`.npmrc` → `strict-allow-scripts`).
- `npm run smoke` fails when the built artifact stops matching the documented
  import styles.

Agents may stage and commit locally, but **pushing is a human step** — ask for
it rather than working around the deny rule.

Use [Conventional Commits](https://www.conventionalcommits.org/)
(`feat:`, `fix:`, `chore:`, `ci:`, `docs:`, …). Breaking changes need a
`BREAKING CHANGE:` footer (or `feat!:` / `fix!:`) so release-please can cut
the major. See `.github/CONTRIBUTING.md`.

Only `dist/` is published. Keep runtime dependencies at zero. Keep the
published JS minified. Keep the devDependency count low — prefer a Node
built-in over a package. Do not add GitHub Team/Enterprise/Advanced Security
features — this is a public GitHub Free repo.
