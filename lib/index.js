'use strict'

const fs = require('fs')
const express = require('express')

function getDataFromPath (apiName, method, params, res, next) {
  if (apiName) {
    // console.log(apiName)
    const filePath = 'mock' + apiName
    // eslint-disable-next-line
    fs.exists(
      filePath + '.js',
      function (exist) {
        // console.log(exist,__dirname)
        if (exist) {
          delete require.cache[require.resolve('../../../' + filePath)]
          try {
            const result = require('../../../' + filePath).getData(method, params)
            if (result instanceof Promise) {
              result.then((resData) => {
                addApiResult(res, next, resData)
              }).catch(e => {
                res.status(500).send(e.message)
              })
            } else {
              addApiResult(res, next, result)
            }
          } catch (e) {
            console.error(e.stack)
            res.status(500).send(apiName + ' has errors,please check the code.')
          }
        } else {
          addApiResult(res, next)
        }
      }
    )
  } else {
    addApiResult(res, next)
  }
}

function addApiResult (res, next, result) {
  res.setHeader('Content-Type', 'application/json;charset=utf-8')
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.header('Pragma', 'no-cache')
  res.header('Expires', 0)
  res.header('Access-Control-Allow-Origin', '*')
  // res.header('Access-Control-Allow-Credentials', 'true')
  if (result) {
    res.send(result)
  } else {
    res.status(404).send()
  }
  // next()
}

/**
 * config:(object) {path, mockFile, allowOrigin}
 */
function addRouter (router, config) {
  if (config.allowOrigin) {
    router.options(config.path, function (req, res, next) {
      const localHost = req.headers.origin
      if (config.allowOrigin.indexOf(localHost) > -1) {
        res.header('Access-Control-Allow-Origin', localHost)
        // res.header('Access-Control-Allow-Credentials', 'true')
        res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild')
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
      }
      res.sendStatus(200) // 让options请求快速返回
    })
  }
  if (config.mockFile) {
    router.get(config.path, function (req, res, next) {
      let params = Object.assign({}, req.params, req.query)
      getDataFromPath(config.mockFile, 'GET', params, res, next)
    })
    router.post(config.path, function (req, res, next) {
      let params = Object.assign({}, req.params, req.body)
      getDataFromPath(config.mockFile, 'POST', params, res, next)
    })
    router.delete(config.path, function (req, res, next) {
      let params = Object.assign({}, req.params, req.body)
      getDataFromPath(config.mockFile, 'DELETE', params, res, next)
    })
    router.put(config.path, function (req, res, next) {
      let params = Object.assign({}, req.params, req.body)
      getDataFromPath(config.mockFile, 'PUT', params, res, next)
    })
  } else {
    router.get(config.path, function (req, res, next) {
      getDataFromPath(req.path, 'GET', req.query, res, next)
    })
    router.post(config.path, function (req, res, next) {
      getDataFromPath(req.path, 'POST', req.body, res, next)
    })
    router.delete(config.path, function (req, res, next) {
      getDataFromPath(req.path, 'DELETE', req.body, res, next)
    })
    router.put(config.path, function (req, res, next) {
      getDataFromPath(req.path, 'PUT', req.body, res, next)
    })
  }
}
function creatRouter (apiConfig, allowOrigin) {
  const router = express.Router()

  for (const s in apiConfig) {
    const rConfig = apiConfig[s]
    addRouter(router, {
      path: rConfig.path,
      allowOrigin: allowOrigin,
      mockFile: rConfig.file
    })
  }
  addRouter(router, {
    path: '/*',
    allowOrigin: allowOrigin
  })
  return router
}

module.exports = creatRouter
