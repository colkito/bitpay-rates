'use strict'

const bitpayRates = require('../lib/rates')

bitpayRates.get('ARS', (err, res) => {
  console.log('Error:', err)
  console.log('Rate:', res)
})

bitpayRates.get((err, res) => {
  console.log('Error:', err)
  console.log('Rates:', res)
})
