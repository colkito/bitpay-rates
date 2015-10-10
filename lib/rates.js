'use strict';

var jsonquest = require('jsonquest');

exports.rates = function (code, callback) {
  var codeUppercase = code.toUpperCase();

  jsonquest({
    host: 'bitpay.com',
    path: '/rates/' + codeUppercase,
    protocol: 'https'
  }, function (err, res, body) {
    if (err) return callback(err);
    return callback(null, body.data);
  });
};
