# bitpay-rates

[![Build Status](https://img.shields.io/travis/bycolco/bitpay-rates.svg?style=flat-square)](https://travis-ci.org/bycolco/bitpay-rates)
[![BundlePhobia](https://img.shields.io/bundlephobia/min/bitpay-rates.svg?style=flat-square)](https://bundlephobia.com/result?p=bitpay-rates)
[![BundlePhobia](https://img.shields.io/bundlephobia/minzip/bitpay-rates.svg?style=flat-square)](https://bundlephobia.com/result?p=bitpay-rates)

A tiny (and zero-deps) wrapper for the [BitPay](https://bitpay.com/rates) Rates API. Now written in TypeScript.

This module returns a `Promise` but can be used with a `Callback` as well. ✨

## Requirements

- nodejs >= 10.x

## Installing

Using yarn:

```bash
yarn add bitpay-rates
```

Using npm:

```bash
npm i bitpay-rates --save
```

## Examples

Getting a rate by code

```js
import bitpayRates from 'bitpay-rates';

const code = 'ARS'; // see list of codes bellow

// Using promise
const ratePromise = bitpayRates.get(code);
ratePromise
  .then(rate => console.log('Promise Rate:', rate)) // i.e { code: 'ARS', name: 'Argentine Peso', rate: 440369.72 }
  .catch(err => console.log('Promise Error:', err));

// Using callback
bitpayRates.get(code, (err, res) => {
  console.log('Callback Error:', err);
  console.log('Callback Rate:', res); // i.e { code: 'ARS', name: 'Argentine Peso', rate: 440369.72 }
});
```

Successful response

```json
{
  "code": "ARS",
  "name": "Argentine Peso",
  "rate": 440369.72
}
```

Getting all the rates

```js
import bitpayRates from 'bitpay-rates';

// Using promise
const ratesPromise = bitpayRates.get();
ratesPromise
  .then(rates => console.log('Promise Rates:', rates)) // i.e [{ code: 'ARS', name: 'Argentine Peso', rate: 440369.72 }, {...}]
  .catch(err => console.log('Promise Error:', err));

// Using callback
bitpayRates.get((err, res) => {
  console.log('Callback Error:', err);
  console.log('Callback Rates:', res); // i.e [{ code: 'ARS', name: 'Argentine Peso', rate: 440369.72 }, {...}]
});
```

Successful response

```json
[
  {
    "code": "ARS",
    "name": "Argentine Peso",
    "rate": 440369.72
  },
  {
    "code": "USD",
    "name": "US Dollar",
    "rate": 7039.17
  },
  {...}
]
```

## Available Codes (updated: 2020-04-15)

The complete list of 166 codes:

- BTC (Bitcoin)
- BCH (Bitcoin Cash)
- USD (US Dollar)
- EUR (Eurozone Euro)
- GBP (Pound Sterling)
- JPY (Japanese Yen)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- CNY (Chinese Yuan)
- CHF (Swiss Franc)
- SEK (Swedish Krona)
- NZD (New Zealand Dollar)
- KRW (South Korean Won)
- ETH (Ether)
- XRP (Ripple)
- AED (UAE Dirham)
- AFN (Afghan Afghani)
- ALL (Albanian Lek)
- AMD (Armenian Dram)
- ANG (Netherlands Antillean Guilder)
- AOA (Angolan Kwanza)
- ARS (Argentine Peso)
- AWG (Aruban Florin)
- AZN (Azerbaijani Manat)
- BAM (Bosnia-Herzegovina Convertible Mark)
- BBD (Barbadian Dollar)
- BDT (Bangladeshi Taka)
- BGN (Bulgarian Lev)
- BHD (Bahraini Dinar)
- BIF (Burundian Franc)
- BMD (Bermudan Dollar)
- BND (Brunei Dollar)
- BOB (Bolivian Boliviano)
- BRL (Brazilian Real)
- BSD (Bahamian Dollar)
- BTN (Bhutanese Ngultrum)
- BWP (Botswanan Pula)
- BYN (Belarusian Ruble)
- BZD (Belize Dollar)
- CDF (Congolese Franc)
- CLF (Chilean Unit of Account (UF))
- CLP (Chilean Peso)
- COP (Colombian Peso)
- CRC (Costa Rican Colón)
- CUP (Cuban Peso)
- CVE (Cape Verdean Escudo)
- CZK (Czech Koruna)
- DJF (Djiboutian Franc)
- DKK (Danish Krone)
- DOP (Dominican Peso)
- DZD (Algerian Dinar)
- EGP (Egyptian Pound)
- ETB (Ethiopian Birr)
- FJD (Fijian Dollar)
- FKP (Falkland Islands Pound)
- GEL (Georgian Lari)
- GHS (Ghanaian Cedi)
- GIP (Gibraltar Pound)
- GMD (Gambian Dalasi)
- GNF (Guinean Franc)
- GTQ (Guatemalan Quetzal)
- GUSD (Gemini US Dollar)
- GYD (Guyanaese Dollar)
- HKD (Hong Kong Dollar)
- HNL (Honduran Lempira)
- HRK (Croatian Kuna)
- HTG (Haitian Gourde)
- HUF (Hungarian Forint)
- IDR (Indonesian Rupiah)
- ILS (Israeli Shekel)
- INR (Indian Rupee)
- IQD (Iraqi Dinar)
- IRR (Iranian Rial)
- ISK (Icelandic Króna)
- JEP (Jersey Pound)
- JMD (Jamaican Dollar)
- JOD (Jordanian Dinar)
- KES (Kenyan Shilling)
- KGS (Kyrgystani Som)
- KHR (Cambodian Riel)
- KMF (Comorian Franc)
- KPW (North Korean Won)
- KWD (Kuwaiti Dinar)
- KYD (Cayman Islands Dollar)
- KZT (Kazakhstani Tenge)
- LAK (Laotian Kip)
- LBP (Lebanese Pound)
- LKR (Sri Lankan Rupee)
- LRD (Liberian Dollar)
- LSL (Lesotho Loti)
- LYD (Libyan Dinar)
- MAD (Moroccan Dirham)
- MDL (Moldovan Leu)
- MGA (Malagasy Ariary)
- MKD (Macedonian Denar)
- MMK (Myanma Kyat)
- MNT (Mongolian Tugrik)
- MOP (Macanese Pataca)
- MRU (Mauritanian Ouguiya)
- MUR (Mauritian Rupee)
- MVR (Maldivian Rufiyaa)
- MWK (Malawian Kwacha)
- MXN (Mexican Peso)
- MYR (Malaysian Ringgit)
- MZN (Mozambican Metical)
- NAD (Namibian Dollar)
- NGN (Nigerian Naira)
- NIO (Nicaraguan Córdoba)
- NOK (Norwegian Krone)
- NPR (Nepalese Rupee)
- OMR (Omani Rial)
- PAB (Panamanian Balboa)
- PAX (Paxos Standard USD)
- PEN (Peruvian Nuevo Sol)
- PGK (Papua New Guinean Kina)
- PHP (Philippine Peso)
- PKR (Pakistani Rupee)
- PLN (Polish Zloty)
- PYG (Paraguayan Guarani)
- QAR (Qatari Rial)
- RON (Romanian Leu)
- RSD (Serbian Dinar)
- RUB (Russian Ruble)
- RWF (Rwandan Franc)
- SAR (Saudi Riyal)
- SBD (Solomon Islands Dollar)
- SCR (Seychellois Rupee)
- SDG (Sudanese Pound)
- SGD (Singapore Dollar)
- SHP (Saint Helena Pound)
- SLL (Sierra Leonean Leone)
- SOS (Somali Shilling)
- SRD (Surinamese Dollar)
- STN (São Tomé and Príncipe Dobra)
- SVC (Salvadoran Colón)
- SYP (Syrian Pound)
- SZL (Swazi Lilangeni)
- THB (Thai Baht)
- TJS (Tajikistani Somoni)
- TMT (Turkmenistani Manat)
- TND (Tunisian Dinar)
- TOP (Tongan Paʻanga)
- TRY (Turkish Lira)
- TTD (Trinidad and Tobago Dollar)
- TWD (New Taiwan Dollar)
- TZS (Tanzanian Shilling)
- UAH (Ukrainian Hryvnia)
- UGX (Ugandan Shilling)
- USDC (Circle USD Coin)
- UYU (Uruguayan Peso)
- UZS (Uzbekistan Som)
- VEF (Venezuelan Bolívar Fuerte)
- VES (Venezuelan Bolívar Soberano)
- VND (Vietnamese Dong)
- VUV (Vanuatu Vatu)
- WST (Samoan Tala)
- XAF (CFA Franc BEAC)
- XAG (Silver (troy ounce))
- XAU (Gold (troy ounce))
- XCD (East Caribbean Dollar)
- XPF (CFP Franc)
- XOF (CFA Franc BCEAO)
- YER (Yemeni Rial)
- ZAR (South African Rand)
- ZMW (Zambian Kwacha)
- ZWL (Zimbabwean Dollar)

## Related Packages

- [Blockchain Exchange Rates API](https://npmjs.com/blockchain-rates)