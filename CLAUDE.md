# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

bitpay-rates is a lightweight, zero-runtime-dependency Node.js wrapper for the BitPay exchange
rates API, written in TypeScript. It exposes a single promise-based function to fetch
cryptocurrency exchange rates.

## Commands

- **Run tests**: `npm test`
- **Run tests in watch mode**: `npm run test:watch`
- **Run a single test**: `npx tsx --test --test-name-pattern "<name>" src/index.test.ts`
- **Lint** (types + Biome): `npm run lint`
- **Format / autofix**: `npm run format`
- **Build**: `npm run build`
- **Type check only**: `tsc --noEmit`

## Architecture

The library is a single-file module (`src/index.ts`) that exports one function:

- `get(code?: string)` — Returns a Promise that resolves to a single `RateObj` (when a currency
  code is provided) or an array of `RateObj` (when no code is provided). The API is
  **promise-only**; there is no callback interface.

It uses Node's native `https` module (no runtime dependencies) and applies a request timeout that
rejects the promise if BitPay does not respond.

### Types

- `RateObj` — `{ code: string; name: string; rate: number }`
- `RateResponse` — `RateObj | RateObj[]`

### API

The library calls `https://bitpay.com/api/rates` (or `/api/rates/{CODE}` for a specific currency;
the code is uppercased automatically). See CODES.md for the full list of supported currency codes.

## Tooling

- **Lint + format**: [Biome](https://biomejs.dev) (`biome.json`) replaces ESLint and Prettier.
- **Tests**: Node's built-in test runner (`node:test`) executed through `tsx`. Network calls are
  mocked in `src/index.test.ts`, so tests are deterministic and never hit the real API.
- **Build**: [tsup](https://tsup.egoist.dev) emits a dual ESM + CJS bundle plus declaration files
  to `dist/`, minified. The `exports` map in `package.json` wires `import`, `require`, and `types`.

## Build Output

`npm run build` produces `dist/index.js` (CJS), `dist/index.mjs` (ESM), and `dist/index.d.ts`.
Only `dist/**` is published (see the `files` field in `package.json`).
