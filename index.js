'use strict'

const creatApi = require('./lib/router')

module.exports = function (apiConfig, allowOrigin, supportCROSCookie) {
  const apiRouters = creatApi(apiConfig, allowOrigin, supportCROSCookie)
  return apiRouters.run()
}
