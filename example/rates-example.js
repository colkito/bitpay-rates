'use strict'

const bitpayRates = require('../lib/rates')

// Using Promises
const ratesPromise = bitpayRates.get()
ratesPromise.then(rates => {
  console.log('Promise Rates:', rates)
})
.catch(err => {
  console.log('Promise Error:', err)
})

const ratePromise = bitpayRates.get('ARS')
ratePromise.then(rate => {
  console.log('Promise Rate:', rate)
})
.catch(err => {
  console.log('Promise Error:', err)
})

// Using Callbacks
bitpayRates.get('ARS', (err, res) => {
  console.log('Callback Error:', err)
  console.log('Callback Rate:', res)
})

bitpayRates.get((err, res) => {
  console.log('Callback Error:', err)
  console.log('Callback Rates:', res)
})
