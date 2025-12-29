# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

bitpay-rates is a lightweight, zero-dependency Node.js wrapper for the BitPay exchange rates API, written in TypeScript. It provides a simple promise-based interface to fetch cryptocurrency exchange rates.

## Commands

- **Run tests**: `npm test`
- **Run tests in watch mode**: `npm run test:watch`
- **Run a single test**: `npx jest src/index.test.ts -t "test name"`
- **Lint and fix**: `npm run lint`
- **Format code**: `npm run format`
- **Build**: `npm run build`
- **Type check only**: `tsc --noEmit`

## Architecture

The library is a single-file module (`src/index.ts`) that exports one function:

- `get(code?: string)` - Returns a Promise that resolves to either a single `RateObj` (when a currency code is provided) or an array of `RateObj` (when no code is provided)

The module uses Node.js native `https` module with a keep-alive agent for performance. No external runtime dependencies.

### Types

- `RateObj` - `{ code: string; name: string; rate: number }`
- `RateResponse` - `RateObj | RateObj[]`

### API

The library calls `https://bitpay.com/rates` (or `/rates/{CODE}` for specific currencies). See CODES.md for the full list of 183 supported currency codes.

## Build Output

TypeScript compiles to `dist/` and the output is minified using jsmin. Declaration files (`.d.ts`) are also generated and minified.
