bitpay-rates
============

[![Build Status](https://img.shields.io/travis/colkito/bitpay-rates.svg?style=flat-square)](https://travis-ci.org/colkito/bitpay-rates)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg?style=flat-square)](https://github.com/sindresorhus/xo)
[![Beerpay](https://beerpay.io/colkito/bitpay-rates/badge.svg?style=flat-square)](https://beerpay.io/colkito/bitpay-rates)
[![Beerpay](https://beerpay.io/colkito/bitpay-rates/make-wish.svg?style=flat-square)](https://beerpay.io/colkito/bitpay-rates?focus=wish)

This is a simple implementation of the [Bitpay](https://bitpay.com) Rates API, written for nodejs.
Returns a `Promise` but can be used with `Callback` as well. ✨

## 😪 Installing

Using yarn:

```bash
$ yarn add bitpay-rates
```

Using npm:

```bash
$ npm i bitpay-rates --save
```

## 🤓 Example

Getting a rate

```js
import bitpayRates from 'bitpay-rates'

const code = 'ARS' // see list of codes bellow

// Using Promises
const ratePromise = bitpayRates.get(code)
ratePromise.then(rate => {
  console.log('Promise Rate:', rate)
})
.catch(err => {
  console.log('Promise Error:', err)
})

// Using Callback
bitpayRates.get(code, (err, res) => {
  console.log('Error:', err)
  console.log('Rate:', res)
})
```

Getting all the rates

```js
import bitpayRates from 'bitpay-rates'

// Using Promises
const ratesPromise = bitpayRates.get()
ratesPromise.then(rates => {
  console.log('Promise Rates:', rates)
})
.catch(err => {
  console.log('Promise Error:', err)
})

// Using Callback
bitpayRates.get((err, res) => {
  console.log('Error:', err)
  console.log('Rates:', res)
})
```


### 👴 ES5
Getting a rate

```js
const bitpayRates = require('bitpay-rates')
const code = 'ARS' // see list of codes bellow

// Using Promises
const ratePromise = bitpayRates.get(code)
ratePromise.then(rate => {
  console.log('Promise Rate:', rate)
})
.catch(err => {
  console.log('Promise Error:', err)
})

// Using Callback
bitpayRates.get(code, (err, res) => {
  console.log('Error:', err)
  console.log('Rate:', res)
})
```

Getting all the rates

```js
const bitpayRates = require('bitpay-rates')

// Using Promises
const ratesPromise = bitpayRates.get()
ratesPromise.then(rates => {
  console.log('Promise Rates:', rates)
})
.catch(err => {
  console.log('Promise Error:', err)
})

// Using Callback
bitpayRates.get((err, res) => {
  console.log('Error:', err)
  console.log('Rates:', res)
})
```

## 🌎 Codes (updated: 2018-01-16)
The complete list of 159 codes:

- BTC (Bitcoin)
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
- BCH (Bitcoin Cash)
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
- MRO (Mauritanian Ouguiya)
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
- STD (São Tomé and Príncipe Dobra)
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
- UYU (Uruguayan Peso)
- UZS (Uzbekistan Som)
- VEF (Venezuelan Bolívar Fuerte)
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

## Support on Beerpay
Hey dude! Help me out for a couple of :beers:!

[![Beerpay](https://beerpay.io/colkito/bitpay-rates/badge.svg?style=beer-square)](https://beerpay.io/colkito/bitpay-rates)  [![Beerpay](https://beerpay.io/colkito/bitpay-rates/make-wish.svg?style=flat-square)](https://beerpay.io/colkito/bitpay-rates?focus=wish)


🤘