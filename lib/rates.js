'use strict'

const https = require('https')

exports.get = (code, callback) => {
  let path = '/rates'
  let cb = code

  if (typeof code !== 'function') {
    const codeUppercase = code.toUpperCase()

    path += '/' + codeUppercase
    cb = callback
  }

  const options = {
    host: 'bitpay.com',
    path: path,
    method: 'GET',
    headers: {},
    agent: false
  }

  let req = https.request(options)

  req.end()

  req.on('error', cb)

  req.on('response', res => {
    var data = ''

    res.on('data', chunk => {
      data += chunk.toString('utf8')
    })

    res.on('end', _ => {
      var parsed

      try {
        parsed = JSON.parse(data)
      } catch (ex) {
        parsed = data
      }

      cb(null, parsed.data)
    })
  })
}
