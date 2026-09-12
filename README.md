# bitpay-rates

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/colkito/bitpay-rates/ci.yml?style=flat-square)
[![npm](https://img.shields.io/npm/v/bitpay-rates.svg?style=flat-square)](https://www.npmjs.com/package/bitpay-rates)
[![BundlePhobia](https://img.shields.io/bundlephobia/min/bitpay-rates.svg?style=flat-square)](https://bundlephobia.com/result?p=bitpay-rates)
[![BundlePhobia](https://img.shields.io/bundlephobia/minzip/bitpay-rates.svg?style=flat-square)](https://bundlephobia.com/result?p=bitpay-rates)

A lightweight Node.js wrapper for [BitPay exchange rates](https://www.bitpay.com/exchange-rates), written in TypeScript.

Zero runtime dependencies, promise-based, dual ESM + CommonJS. Talks to the
official public [Rates API](https://developer.bitpay.com/reference/rates)
(`X-Accept-Version: 2.0.0`).

## Requirements

- Node.js >= 22

```bash
npm install bitpay-rates
```

## Breaking changes in v3

- **Promise-only.** The legacy callback signature (`get(code, cb)`) is gone —
  use `async/await` or `.then()` / `.catch()`.
- Dual ESM + CJS with an `exports` map (`import` and `require` both work).
- Node.js >= 22.
- Requests time out after 10 seconds.
- `get('ETH')` (and other crypto codes) now returns the **single** BTC/quote
  rate, not the full table for that asset as a base. Use `get('USD', 'ETH')`
  for a non-BTC pair.
- Currency codes are validated (`/^[A-Z0-9]{2,10}$/`); anything else rejects
  with a `TypeError` instead of being sent to the API.

## Usage

### ESM / TypeScript

```ts
import { get, type RateObj } from 'bitpay-rates';

const usd: RateObj = await get('USD');
// GET https://bitpay.com/rates/BTC/USD
// { code: 'USD', name: 'US Dollar', rate: 76471.42 }

const all = await get();
// GET https://bitpay.com/rates/BTC  → RateObj[]

const ethUsd = await get('USD', 'ETH');
// GET https://bitpay.com/rates/ETH/USD
```

The default export is a namespace object holding the same function, so the
v2 style keeps working:

```ts
import bitpayRates from 'bitpay-rates';

const usd = await bitpayRates.get('USD');
```

### CommonJS

```js
const { get } = require('bitpay-rates');
// or: const bitpayRates = require('bitpay-rates'); bitpayRates.get('USD')

get('USD')
  .then((rate) => console.log(rate))
  .catch((err) => console.error(err));
```

All four styles — named or default, ESM or CommonJS — are asserted against the
built artifact on every CI run and before every publish (`npm run smoke`).

### Errors

`get()` rejects when BitPay returns a non-2xx status, an `{ error }` payload,
malformed JSON, a network failure, or when the request exceeds 10 seconds. It
rejects with a `TypeError` — before any request — when a code is not 2-10
alphanumeric characters.

```js
import { get } from 'bitpay-rates';

get('INVALID')
  .then((rate) => console.log(rate))
  .catch((err) => console.error(err));
```

More examples in [`example/rates-example.mjs`](example/rates-example.mjs)
(run `npm run build` first).

## Types

```ts
type RateObj = { code: string; name: string; rate: number };
type RateResponse = RateObj | RateObj[];

function get(): Promise<RateObj[]>;
function get(quote: string): Promise<RateObj>;
function get(quote: string, base: string): Promise<RateObj>;
```

`quote` and `base` are uppercased automatically and must match
`/^[A-Z0-9]{2,10}$/`. Default `base` is `BTC`.

## Available codes

See [CODES.md](CODES.md). It is regenerated from `GET /rates/BTC` on every
release PR (`npm run update-codes`).

## Security

Zero runtime dependencies, published from CI only via npm Trusted Publishing
(OIDC) with a provenance attestation, and every release is gated on a human
publishing the draft GitHub Release. See
[SECURITY.md](.github/SECURITY.md) to report a vulnerability.

## Contributing

PRs only — see [CONTRIBUTING.md](.github/CONTRIBUTING.md). MIT licensed.

## Related packages

- [Blockchain Exchange Rates API](https://npmjs.com/blockchain-rates)
