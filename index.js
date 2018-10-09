'use strict'

const creatApi = require('./lib/router')

module.exports = function (mockConfig) {
  const apiRouters = new creatApi(mockConfig)
  return apiRouters.run()
}
