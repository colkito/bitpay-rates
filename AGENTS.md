# Agent guide

bitpay-rates is a **zero-runtime-dependency** Node.js wrapper for the BitPay
exchange rates API. One promise-based function. This file is the source of
truth for coding agents. `CLAUDE.md` and `.github/copilot-instructions.md`
point here.

## Requirements

- **Develop** on Node **>= 22.18** (`package.json#devEngines` — `npm ci` fails
  with `EBADDEVENGINES` below that). `.nvmrc`, the `quality` job and the
  publish job pin **24**.
- **Consumers** need Node >= 22 (`package.json#engines`). Tests run on 22, 24
  and 26.
- Keep `@types/node` on the **22.x** line (oldest supported Node, not the one
  we develop on).

## Commands

**Before opening a PR, run `npm run verify`.** That is lint + knip + tests +
build + packaging smoke test — the same command the `quality` job runs. CI
then adds three network checks: `npm audit`, `npm audit signatures` and
`@arethetypeswrong/cli`.

| Script | What |
| --- | --- |
| `npm test` | unit tests (`node --test`, no transpiler) |
| `npm run test:watch` | same, watch mode |
| `npm run test:coverage` | coverage |
| `npm run lint` | `tsc --noEmit` + Biome |
| `npm run format` | Biome write |
| `npm run knip` | dead code |
| `npm run build` | tsdown → `dist/` |
| `npm run smoke` | load `dist/` and assert import styles (needs a build) |
| `npm run update-codes` | live BitPay API → `CODES.md`. **Release PR only.** Do not run on a feature PR and do not hand-edit `CODES.md`. |

Single test: `node --test --test-name-pattern "<name>" src/index.test.mts`

Do not edit `dist/` or `package-lock.json` by hand; run `npm ci`. Adding a
dependency needs human approval first, then
`npm install --save-exact --save-dev <pkg>@<version>`.

`prepare` installs the git hooks and is a no-op in CI and outside a git checkout.

## Architecture

Single module: `src/index.mts`. Sources are `.mts` so Node runs them directly.

```ts
get(): Promise<RateObj[]>
get(query: { base?: string; quote?: undefined }): Promise<RateObj[]>
get(query: { base?: string; quote: string }): Promise<RateObj>
```

Named `{ base, quote }` — no argument order. The third overload's
`quote?: undefined` is load-bearing: without it, `get(someVariable)` resolves
to the array overload and the declared return type lies.

Named export is `get`. Default export is a namespace `{ get }`, so
`import bitpayRates` / `require(...)` + `bitpayRates.get()` still works.
**Do not change either shape** — `scripts/smoke.mts` asserts all four import
styles against `dist/` in CI and in `prepublishOnly`.

- `get()` → `GET /rates/BTC`
- `get({ base: 'ETH' })` → `GET /rates/ETH`
- `get({ quote: 'USD' })` → `GET /rates/BTC/USD`
- `get({ base: 'ETH', quote: 'USD' })` → `GET /rates/ETH/USD`

Headers: `X-Accept-Version: 2.0.0`, `Accept: application/json`,
`User-Agent: bitpay-rates`. Unwrap `{ data }`. Reject on `{ error }`, non-2xx,
malformed JSON, a 10s timeout, or a response shape that does not match what
was asked for (`/rates/{code}` is polymorphic: BTC is a list, USD is one
rate).

`base` / `quote` are uppercased and must match `/^[A-Z0-9]{2,10}$/` before any
request. Codes with `_` (`USDC_arb`, …) appear in `CODES.md` but BitPay
rejects them as base or quote.

Native `fetch`. No runtime dependencies.

- `RateObj` — `{ code: string; name: string; rate: number }`
- `RateResponse` — `RateObj | RateObj[]`

Docs: https://developer.bitpay.com/reference/rates

## Tooling

- **Lint / format**: Biome. **Tests**: `node:test`. Mock `globalThis.fetch`.
  Reset with `mock.reset()` — `restoreAll()` leaves fake timers on and hangs
  the next test. Never hit the live API.
- **Build**: tsdown → minified `dist/index.mjs` + `dist/index.cjs` and matching
  `.d.mts` / `.d.cts`. The npm tarball is **only `dist/`** (plus README /
  LICENSE / package.json). Do not add files to `package.json#files`.
- **Git hooks** (`scripts/git-hooks/`, installed by `npm ci`): Biome on staged
  files, Conventional Commits, refuse push to `main`.
- **knip** for dead code. **attw** in CI only (not a devDependency, not in
  `verify`). If you touch `exports` / `main` / `types`, run
  `npx --yes @arethetypeswrong/cli@0.18.5 --pack .`
- **Install scripts**: none. `.npmrc` has `strict-allow-scripts=true`, so a new
  one fails `npm ci`. Keep `package.json#allowScripts` empty.

## Policy

**You may** create a branch, commit, push that branch, and open a pull request.

**You may not** push `main`/`master`, merge a PR, publish a GitHub Release,
publish the package, or change branch protection. If you think a rule is
wrong, say so in the PR and stop.

What actually stops you is server-side: branch protection on `main` with
`enforce_admins`, a credential without merge rights, npm Trusted Publishing
bound to one workflow, and a human publishing the draft release.

The local `pre-push` hook refuses `main` for any tool in this clone. It is
skipped by `--no-verify`. `.claude/settings.json` is prefix matches, not a
control (`npx`, `eval`, an absolute path walk around them). Do not add a
command parser.

Loud failures — fix the cause, do not work around them:

- `npm ci` → `EBADDEVENGINES` on Node < 22.18
- `npm ci` fails when a dependency gains an install script
- `npm run smoke` fails when `dist/` no longer matches the documented imports

Conventional Commits (`feat:`, `fix:`, `chore:`, …). Breaking changes need
`BREAKING CHANGE:` or `feat!:` / `fix!:`. See `.github/CONTRIBUTING.md`.

Keep runtime dependencies at zero, published JS minified, and the
devDependency count low. This is a public GitHub Free repo — no Team /
Enterprise / Advanced Security features.
