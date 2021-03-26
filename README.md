# bitpay-rates

[![Build Status](https://img.shields.io/travis/bycolco/bitpay-rates.svg?style=flat-square)](https://travis-ci.org/bycolco/bitpay-rates)
[![BundlePhobia](https://img.shields.io/bundlephobia/min/bitpay-rates.svg?style=flat-square)](https://bundlephobia.com/result?p=bitpay-rates)
[![BundlePhobia](https://img.shields.io/bundlephobia/minzip/bitpay-rates.svg?style=flat-square)](https://bundlephobia.com/result?p=bitpay-rates)

A tiny (and zero-deps) wrapper for the [BitPay](https://bitpay.com/rates) Rates API. Now written in TypeScript.

This module returns a `Promise` but can be used with a `Callback` as well. ✨

## Requirements

- nodejs >= 10.x

## Examples

Getting a rate by code

```js
import bitpayRates from 'bitpay-rates';

const code = 'BUSD'; // see list of codes bellow

// Using promise
const ratePromise = bitpayRates.get(code);
ratePromise
  .then((rate) => console.log('Promise Rate:', rate))
  .catch((err) => console.log('Promise Error:', err));

// Using callback
bitpayRates.get(code, (err, res) => {
  console.log('Callback Error:', err);
  console.log('Callback Rate:', res);
});
```

Successful response

```json
{
  "code": "BUSD",
  "name": "Binance USD",
  "rate": 57818.28
}
```

Getting all the rates

```js
import bitpayRates from 'bitpay-rates';

// Using promise
const ratesPromise = bitpayRates.get();
ratesPromise
  .then((rates) => console.log('Promise Rates:', rates))
  .catch((err) => console.log('Promise Error:', err));

// Using callback
bitpayRates.get((err, res) => {
  console.log('Callback Error:', err);
  console.log('Callback Rates:', res);
});
```

Successful response

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

## Available Codes (updated: 2021-03-21)

[Follow this link](CODES.md#available-codes-updated-2021-03-21) to see the complete list of 169 codes.

## Related Packages

- [Blockchain Exchange Rates API](https://npmjs.com/blockchain-rates)
