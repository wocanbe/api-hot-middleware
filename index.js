'use strict'

const creatApi = require('./lib')

module.exports = function (apiConfig, allowOrigin) {
  return creatApi(apiConfig, allowOrigin)
}
