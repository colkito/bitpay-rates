# bitpay-rates

[![Build Status](https://img.shields.io/travis/colcodev/bitpay-rates.svg?style=flat-square)](https://travis-ci.org/colcodev/bitpay-rates)
[![BundlePhobia](https://img.shields.io/bundlephobia/min/bitpay-rates.svg?style=flat-square)](https://bundlephobia.com/result?p=bitpay-rates)
[![BundlePhobia](https://img.shields.io/bundlephobia/minzip/bitpay-rates.svg?style=flat-square)](https://bundlephobia.com/result?p=bitpay-rates)

A NodeJS (+8.x) wrapper for [Bitpay](https://bitpay.com/rates) Rates API.
Returns a `Promise` but can be used with `Callback` as well. ✨

## Installing

Using yarn:

```bash
$ yarn add bitpay-rates
```

Using npm:

```bash
$ npm i bitpay-rates --save
```

## Example

Getting a rate

```js
import bitpayRates from "bitpay-rates";

const code = "ARS"; // see list of codes bellow

// Using Promises
const ratePromise = bitpayRates.get(code);
ratePromise
  .then(rate => console.log("Promise Rate:", rate))
  .catch(err => console.log("Promise Error:", err));

// Using Callback
bitpayRates.get(code, (err, res) => {
  console.log("Callback Error:", err);
  console.log("Callback Rate:", res);
});
```

Getting all the rates

```js
import bitpayRates from "bitpay-rates";

// Using Promises
const ratesPromise = bitpayRates.get();
ratesPromise
  .then(rates => console.log("Promise Rates:", rates))
  .catch(err => console.log("Promise Error:", err));

// Using Callback
bitpayRates.get((err, res) => {
  console.log("Callback Error:", err);
  console.log("Callback Rates:", res);
});
```

## Available Codes (updated: 2019-12-15)

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
- XCD (East Caribbean Dollar)
- XOF (CFA Franc BCEAO)
- XPF (CFP Franc)
- YER (Yemeni Rial)
- ZAR (South African Rand)
- ZMW (Zambian Kwacha)
- ZWL (Zimbabwean Dollar)
- XAG (Silver (troy ounce))
- XAU (Gold (troy ounce))
