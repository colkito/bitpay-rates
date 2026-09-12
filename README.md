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

- Node.js >= 20

```bash
npm install bitpay-rates
```

## Breaking changes in v3

- **Promise-only.** The legacy callback signature (`get(code, cb)`) is gone —
  use `async/await` or `.then()` / `.catch()`.
- Dual ESM + CJS with an `exports` map (`import` and `require` both work).
- Node.js >= 20.
- Requests time out after 10 seconds.
- `get('ETH')` (and other crypto codes) now returns the **single** BTC/quote
  rate, not the full table for that asset as a base. Use `get('USD', 'ETH')`
  for a non-BTC pair.

## Usage

### ESM / TypeScript

```ts
import bitpayRates, { type RateObj } from 'bitpay-rates';

const usd: RateObj = await bitpayRates.get('USD');
// GET https://bitpay.com/rates/BTC/USD
// { code: 'USD', name: 'US Dollar', rate: 76471.42 }

const all = await bitpayRates.get();
// GET https://bitpay.com/rates/BTC  → RateObj[]

const ethUsd = await bitpayRates.get('USD', 'ETH');
// GET https://bitpay.com/rates/ETH/USD
```

### CommonJS

```js
const bitpayRates = require('bitpay-rates');

bitpayRates
  .get('USD')
  .then((rate) => console.log(rate))
  .catch((err) => console.error(err));
```

### Errors

`get()` rejects when BitPay returns a non-2xx status, an `{ error }` payload,
malformed JSON, a network failure, or when the request exceeds 10 seconds.

```js
import bitpayRates from 'bitpay-rates';

bitpayRates
  .get('INVALID')
  .then((rate) => console.log(rate))
  .catch((err) => console.error(err));
```

More examples in [`example/rates-example.mjs`](example/rates-example.mjs)
(run `npm run build` first).

## Types

```ts
type RateObj = { code: string; name: string; rate: number };

function get(): Promise<RateObj[]>;
function get(quote: string): Promise<RateObj>;
function get(quote: string, base: string): Promise<RateObj>;
```

`quote` and `base` are uppercased automatically. Default `base` is `BTC`.

## Available codes

See [CODES.md](CODES.md). It is regenerated from `GET /rates/BTC` on every
release PR (`npm run update-codes`).

## Contributing

PRs only — see [CONTRIBUTING.md](.github/CONTRIBUTING.md). MIT licensed.

## Related packages

- [Blockchain Exchange Rates API](https://npmjs.com/blockchain-rates)
