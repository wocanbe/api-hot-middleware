'use strict'
const fs = require('fs')

function getDataFromPath (apiName, method, params) {
  return new Promise((resolve, reject) => {
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
                  resolve(resData)
                }).catch(e => {
                  reject(e)
                })
              } else {
                resolve(result)
              }
            } catch (e) {
              console.error(e.stack)
              reject(new Error(apiName + ' has errors,please check the code.'))
            }
          } else {
            reject(new Error('Status 404'))
          }
        }
      )
    } else {
      reject(new Error('Status 404'))
    }
  })
}

module.exports = getDataFromPath
