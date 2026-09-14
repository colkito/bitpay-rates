# bitpay-rates

[![CI](https://img.shields.io/github/actions/workflow/status/colkito/bitpay-rates/ci.yml?style=flat-square&label=CI)](https://github.com/colkito/bitpay-rates/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/bitpay-rates.svg?style=flat-square)](https://www.npmjs.com/package/bitpay-rates)
[![unpacked size](https://img.shields.io/npm/unpacked-size/bitpay-rates.svg?style=flat-square)](https://www.npmjs.com/package/bitpay-rates)

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
- **Named arguments.** `get()` now takes a single `{ base, quote }` object, so
  there is no argument order to remember: `get('USD', 'ETH')` becomes
  `get({ base: 'ETH', quote: 'USD' })`.
- `get({ base })` returns the **whole table** for that base, which v2 could not
  express. `get({ quote })` returns that one rate against BTC.
- Dual ESM + CJS with an `exports` map (`import` and `require` both work).
- Node.js >= 22.
- Requests time out after 10 seconds.
- Currency codes are validated (`/^[A-Z0-9]{2,10}$/`); anything else rejects
  with a `TypeError` before a request is made.

## Usage

### ESM / TypeScript

```ts
import { get, type RateObj } from 'bitpay-rates';

const all: RateObj[] = await get();
// GET /rates/BTC  → every rate against BTC

const vsEth: RateObj[] = await get({ base: 'ETH' });
// GET /rates/ETH  → every rate against ETH

const usd: RateObj = await get({ quote: 'USD' });
// GET /rates/BTC/USD  → { code: 'USD', name: 'US Dollar', rate: 76471.42 }

const ethUsd: RateObj = await get({ base: 'ETH', quote: 'USD' });
// GET /rates/ETH/USD
```

`base` is the cryptocurrency you are pricing (default `BTC`); `quote` is the
currency you want the price in. Omitting `quote` gives the full table. The
return type follows from that: `RateObj[]` without `quote`, `RateObj` with it.

The default export is a namespace object holding the same function, so the v2
import style keeps working:

```ts
import bitpayRates from 'bitpay-rates';

const usd = await bitpayRates.get({ quote: 'USD' });
```

### CommonJS

```js
const { get } = require('bitpay-rates');
// or: const bitpayRates = require('bitpay-rates'); bitpayRates.get({ quote: 'USD' })

get({ quote: 'USD' })
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

It also rejects when the response shape does not match what you asked for.
`GET /rates/{code}` is polymorphic: a base with a rate table answers with a
list, anything else answers with a single rate. So `get({ base: 'USD' })`
rejects rather than handing you a `RateObj` typed as `RateObj[]`.

```js
import { get } from 'bitpay-rates';

get({ quote: 'INVALID' })
  .then((rate) => console.log(rate))
  .catch((err) => console.error(err));
```

More examples in [`example/rates-example.mjs`](example/rates-example.mjs)
(run `npm run build` first).

## Types

```ts
type RateObj = { code: string; name: string; rate: number };
type RateQuery = { base?: string; quote?: string };

function get(): Promise<RateObj[]>;
function get(query: { base?: string; quote?: undefined }): Promise<RateObj[]>;
function get(query: { base?: string; quote: string }): Promise<RateObj>;
```

Both codes are uppercased automatically and must match `/^[A-Z0-9]{2,10}$/`.
Default `base` is `BTC`.

## Available codes

See [CODES.md](CODES.md). It is regenerated from `GET /rates/BTC` on every
release PR (`npm run update-codes`). Codes containing `_` (chain-specific
variants such as `USDC_arb`) appear in that table, but BitPay rejects them as a
`base` or `quote`, so they cannot be queried individually.

## Security

Zero runtime dependencies, published from CI only via npm Trusted Publishing
(OIDC) with a provenance attestation, and every release is gated on a human
publishing the draft GitHub Release. See
[SECURITY.md](.github/SECURITY.md) to report a vulnerability.

## Contributing

PRs only — see [CONTRIBUTING.md](.github/CONTRIBUTING.md). MIT licensed.

## Related packages

- [Blockchain Exchange Rates API](https://npmjs.com/blockchain-rates)
