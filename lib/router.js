'use strict'
const express = require('express')
const getDataFromPath = require('./mockFile')

class MockRouter {
  constructor (apiConfig, allowOrigin, supportCROSCookie) {
    this.apiConfig = apiConfig
    this.allowOrigin = allowOrigin || []
    this.isCookie = supportCROSCookie || false
  }
  run () {
    const router = express.Router()
    const apiConfig = this.apiConfig
    for (const s in apiConfig) {
      const rConfig = apiConfig[s]
      this.addRouter(router, {
        path: rConfig.path,
        mockFile: rConfig.file
      })
    }
    this.addRouter(router, {
      path: '/*'
    })
    return router
  }
  addRouter (router, config) {
    console.log('Mock created', config.path)
    if (config.mockFile) {
      router.all(config.path, this.fileMock(config.mockFile))
    } else {
      router.all(config.path, this.normalMock.bind(this))
    }
  }
  fileMock (mockFile) {
    return (req, res, next) => {
      const localHost = req.headers.origin
      if (localHost && this.allowOrigin.indexOf(localHost) === -1) {
        res.status(404).send()
      } else {
        this.addCrosHeader(req, res, next)
        let apiRes
        let params = Object.assign({}, req.params, req.query)
        if (req.method === 'GET') {
          apiRes = getDataFromPath(mockFile, req.method, params)
        } else if (req.method !== 'OPTIONS') {
          params = Object.assign({}, params, req.body)
          apiRes = getDataFromPath(mockFile, req.method, params)
        }
        if (apiRes) {
          apiRes.then(result => {
            res.send(result)
          }).catch(e => {
            if (e.message === 'Status 404') {
              res.status(404).send()
            } else {
              res.status(500).send(e.message)
            }
          })
        }
      }
    }
  }
  normalMock (req, res, next) {
    const localHost = req.headers.origin
    let isForbid = false
    if (localHost) { // 不是来自本地文件(file:///)
      const referer = req.headers.referer
      if (referer.indexOf(localHost + '/') === -1) { // 不是来自本域名的访问
        if (this.allowOrigin.indexOf(localHost) === -1) { // 不在白名单
          isForbid = true
        }
      }
    }
    if (isForbid) {
      res.status(404).send()
    } else {
      this.addCrosHeader(req, res, next)
      let apiRes
      let params = Object.assign({}, req.query)
      if (req.method === 'GET') {
        apiRes = getDataFromPath(req.path, req.method, params)
      } else if (req.method !== 'OPTIONS') {
        params = Object.assign({}, params, req.body)
        apiRes = getDataFromPath(req.path, req.method, params)
      }
      if (apiRes) {
        apiRes.then(result => {
          res.send(result)
        }).catch(e => {
          if (e.message === 'Status 404') {
            res.status(404).send()
          } else {
            res.status(500).send(e.message)
          }
        })
      }
    }
  }
  addCrosHeader (req, res, next) {
    const localHost = req.headers.origin
    res.header('Access-Control-Allow-Origin', localHost)
    if (this.isCookie) {
      res.header('Access-Control-Allow-Credentials', 'true')
    }
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild')
      res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
      res.sendStatus(200) // 让options请求快速返回
    } else {
      res.setHeader('Content-Type', 'application/json;charset=utf-8')
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.header('Pragma', 'no-cache')
      res.header('Expires', 0)
    }
  }
}

module.exports = MockRouter
