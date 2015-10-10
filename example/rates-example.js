'use strict';

var bitpayRates = require('../lib/rates');

bitpayRates.rates('ARS', function (err, res) {
  console.log('Error:', err);
  console.log('Rate:', res);
});
