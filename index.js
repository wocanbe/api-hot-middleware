'use strict'

const creatApi = require('./lib/router')

module.exports = function (apiConfig, allowOrigin, supportCROSCookie) {
  const apiRouters = new creatApi(apiConfig, allowOrigin, supportCROSCookie)
  return apiRouters.run()
}
