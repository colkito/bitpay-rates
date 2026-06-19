# bitpay-rates

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/colkito/bitpay-rates/ci.yml?style=flat-square)
[![BundlePhobia](https://img.shields.io/bundlephobia/min/bitpay-rates.svg?style=flat-square)](https://bundlephobia.com/result?p=bitpay-rates)
[![BundlePhobia](https://img.shields.io/bundlephobia/minzip/bitpay-rates.svg?style=flat-square)](https://bundlephobia.com/result?p=bitpay-rates)

A lightweight Node.js wrapper for [BitPay's](https://bitpay.com/rates) exchange rates API, written in TypeScript.

Zero runtime dependencies, promise-based, and shipped as dual ESM + CommonJS. ✨

## Requirements

- Node.js >= 18

## Breaking changes in v3

- The library is now **promise-only**. The legacy callback signature (`get(code, cb)`) has been
  removed — use `async/await` or `.then()`/`.catch()` instead.
- Ships as dual ESM + CJS with an `exports` map (`import` and `require` both work).

## Examples

Getting a rate by `code`:

```js
import bitpayRates from 'bitpay-rates';

const code = 'ARS'; // see list of codes below

// Using async/await
try {
  const rate = await bitpayRates.get(code);
  console.log(`[Async/Await][${code}] Rate:`, rate);
} catch (err) {
  console.error(`[Async/Await][${code}] Error:`, err);
}
```

Handling an invalid currency code:

```js
import bitpayRates from 'bitpay-rates';

// Handling an invalid currency code
bitpayRates
  .get('INVALID')
  .then((rate) => console.log('[Promise][INVALID] Rate:', rate))
  .catch((err) => console.error('[Promise][INVALID] Error:', err));
```

Successful response:

```json
{
  "code": "ARS",
  "name": "Argentine Peso",
  "rate": 60612542.16
}
```

Getting `all` the rates:

```js
import bitpayRates from 'bitpay-rates';

// Using async/await
try {
  const rates = await bitpayRates.get();
  console.log('[Async/Await] Rates:', rates);
} catch (err) {
  console.error('[Async/Await] Error:', err);
}
```

Successful response:

```json
[
  {
    "code": "ARS",
    "name": "Argentine Peso",
    "rate": 5291987.02
  },
  {
    "code": "BUSD",
    "name": "Binance USD",
    "rate": 57818.28
  },
  {...}
]
```

More examples [here](example/rates-example.js).

## Available Codes (updated: 2024-01-24)

[Follow this link](CODES.md) to see the complete list of codes.

## Related Packages

- [Blockchain Exchange Rates API](https://npmjs.com/blockchain-rates)
