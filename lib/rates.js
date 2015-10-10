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
    host: 'bitpay.com',
    path: path,
    protocol: 'https'
  }, function (err, res, body) {
    if (err) return cb(err);
    return cb(null, body.data);
  });
};
