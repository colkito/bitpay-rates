'use strict';

var bitpayRates = require('../lib/rates');

bitpayRates.get('ARS', function (err, res) {
  console.log('Error:', err);
  console.log('Rate:', res);
});

bitpayRates.get(function (err, res) {
  console.log('Error:', err);
  console.log('Rates:', res);
});
