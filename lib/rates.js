'use strict'

const https = require('https')

global.Promise = require('bluebird')

function get(code, callback) {
  let path = '/rates'
  let cb = callback || function () {}

  if (code) {
    if (typeof code === 'function') {
      cb = code
    } else if (typeof code === 'string') {
      path += '/' + code.toUpperCase()
    }
  }

  return new Promise((resolve, reject) => {
    const options = {
      host: 'bitpay.com',
      path,
      method: 'GET',
      headers: {},
      agent: false
    }

    const req = https.request(options)

    req.end()

    req.on('error', err => {
      reject(err)
      return cb(err)
    })

    req.on('response', res => {
      let data = ''

      res.on('data', chunk => {
        data += chunk.toString('utf8')
      })

      res.on('end', () => {
        let parsed

        try {
          parsed = JSON.parse(data)
        } catch (err) {
          reject(err)
          return cb(err)
        }

        resolve(parsed.data)
        return cb(null, parsed.data)
      })
    })
  })
}

module.exports = {get}
exports.default = {get}
