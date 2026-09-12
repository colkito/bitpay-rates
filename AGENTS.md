# Agent guide

bitpay-rates is a lightweight, **zero-runtime-dependency** Node.js wrapper for
the BitPay exchange rates API. It exposes one promise-based function.

This file is the source of truth for coding agents. `CLAUDE.md` and
`.github/copilot-instructions.md` point here.

## Requirements

Node **>= 22.18** for development (`.nvmrc` pins 22): the build (tsdown) and the
tests (native TypeScript type stripping) both need it. Consumers of the
published package need Node >= 22.

## Commands

- **Test**: `npm test`
- **Test watch**: `npm run test:watch`
- **Coverage**: `npm run test:coverage`
- **Single test**: `node --test --test-name-pattern "<name>" src/index.test.mts`
- **Lint** (types + Biome): `npm run lint`
- **Format**: `npm run format`
- **Dead-code check**: `npm run knip`
- **Build**: `npm run build`
- **Refresh CODES.md**: `npm run update-codes` (hits the live BitPay API).
  Release-please also runs this on the release PR — do not hand-edit CODES.md.
- **Type check only**: `tsc --noEmit`

Do not edit `dist/` or `package-lock.json` by hand. Use `npm ci` or
`npm install --save-exact --save-dev <pkg>@<version>`.

## Architecture

Single module: `src/index.mts`. Sources are `.mts` so Node can run them
directly — there is no TypeScript runner in the dependency tree.

```ts
get(): Promise<RateObj[]>
get(quote: string): Promise<RateObj>
get(quote: string, base: string): Promise<RateObj>
```

- `get()` → `GET https://bitpay.com/rates/BTC` (all quotes vs BTC)
- `get('USD')` → `GET https://bitpay.com/rates/BTC/USD`
- `get('USD', 'ETH')` → `GET https://bitpay.com/rates/ETH/USD`

Always send `X-Accept-Version: 2.0.0` and `Accept: application/json`. Unwrap
`{ data }`. Reject on `{ error }`, non-2xx, malformed JSON, or a 10s timeout
(`AbortController` + `setTimeout`).

`quote` and `base` are uppercased and must match `/^[A-Z0-9]{2,10}$/`; anything
else rejects with a `TypeError` before a request is made, so caller input can
never steer the URL to another path on bitpay.com.

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
- **Install scripts**: `package.json#allowScripts` is the reviewed allowlist and
  `.npmrc` sets `strict-allow-scripts=true`, so an unreviewed install script
  fails `npm ci` instead of running. Adding one is a deliberate, reviewed act.

## Policy

`main` is protected. Agents may **only open pull requests**. Do not:

- push to `main`
- merge pull requests
- publish GitHub Releases
- run `npm publish`

Use [Conventional Commits](https://www.conventionalcommits.org/)
(`feat:`, `fix:`, `chore:`, `ci:`, `docs:`, …). Breaking changes need a
`BREAKING CHANGE:` footer (or `feat!:` / `fix!:`) so release-please can cut
the major. See `.github/CONTRIBUTING.md`.

Only `dist/` is published. Keep runtime dependencies at zero. Keep the
published JS minified. Keep the devDependency count low — prefer a Node
built-in over a package. Do not add GitHub Team/Enterprise/Advanced Security
features — this is a public GitHub Free repo.
