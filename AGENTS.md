# Agent guide

bitpay-rates is a lightweight, **zero-runtime-dependency** Node.js wrapper for
the BitPay exchange rates API. It exposes one promise-based function.

This file is the source of truth for coding agents. `CLAUDE.md` and
`.github/copilot-instructions.md` point here.

## Commands

- **Test**: `npm test`
- **Test watch**: `npm run test:watch`
- **Single test**: `npx tsx --test --test-name-pattern "<name>" src/index.test.ts`
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

Single module: `src/index.ts`.

```ts
get(): Promise<RateObj[]>
get(quote: string): Promise<RateObj>
get(quote: string, base: string): Promise<RateObj>
```

- `get()` → `GET https://bitpay.com/rates/BTC` (all quotes vs BTC)
- `get('USD')` → `GET https://bitpay.com/rates/BTC/USD`
- `get('USD', 'ETH')` → `GET https://bitpay.com/rates/ETH/USD`

Always send `X-Accept-Version: 2.0.0`, `Accept: application/json`, and
`Content-Type: application/json`. Unwrap `{ data }`. Reject on `{ error }`,
non-2xx, malformed JSON, or a 10s timeout (`AbortController` + `setTimeout`).

Uses native `fetch`. No runtime dependencies.

### Types

- `RateObj` — `{ code: string; name: string; rate: number }`
- `RateResponse` — `RateObj | RateObj[]`

Official docs: https://developer.bitpay.com/reference/rates
Public page: https://www.bitpay.com/exchange-rates

## Tooling

- **Lint + format**: Biome (`biome.json`)
- **Tests**: Node `node:test` via `tsx`. Mock `globalThis.fetch`. Never hit the
  live API in tests.
- **Build**: tsdown → minified `dist/index.mjs` (ESM) + `dist/index.cjs` (CJS)
  plus matching `.d.mts` / `.d.cts`. Wired through `exports` in `package.json`.
  The npm tarball is **only `dist/`** (plus README/LICENSE/package.json). Do not
  add files to `package.json#files`.
- **Hooks**: lefthook (`lefthook.yml`) — Biome on staged files, Conventional
  Commits on `commit-msg`.
- **Dead code**: knip

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
published JS minified. Do not add GitHub Team/Enterprise/Advanced Security
features — this is a public GitHub Free repo.
