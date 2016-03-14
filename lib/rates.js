'use strict';

var jsonquest = require('jsonquest');

exports.get = function (code, callback) {
  var path = '/rates',
      cb = code;

  if (typeof code !== 'function') {
    var codeUppercase = code.toUpperCase();

    path += '/' + codeUppercase;
    cb = callback;
  }

  jsonquest({
    protocol: 'https',
    host: 'bitpay.com',
    path: path
  }, function (err, res, body) {
    if (err) return cb(err);
    return cb(null, body.data);
  });
};
