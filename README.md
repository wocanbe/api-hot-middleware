# a api middleware hotloaded

## demo
```javascript
  var express = require('express')
  var bodyParser = require('body-parser')

  var app = express()
  /* 如果你要接收POST、PUT、DELETE请求的参数，必须使用bodyParser处理 */
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  const apiConfig = [{
    path:'/subject/:userId',
    file:'/userInfo'
  },
  {
    path:'/demo/:id',
    file:'/demo'
  }]
  app.use('/api', apiMiddleware(apiConfig));
```
## api demo
```javascript
  const Mock = require('mockjs')
  Mock.Random.extend({
    clsType: function(date) {
      var constellations = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座']
      return this.pick(constellations)
    }
  })

  const item = {
    'type': '@clsType',
    'name': '@cname',
    'birthday': '@date(yyyy-MM-dd)',
    // 'height': '@float(30,220,0,0)',
    'weight': '@float(5,150,2,2)',
    'intro': '@cparagraph(3)'
  };
  const reqMockConfig = {
    'type': '@clsType',
  }

  exports.getData = function(method,data){
    /*
    	method:请求方式(string)，值为GET、POST、PUT、DELETE之一
    	data:参数（Object），用户传递的param1可以用data.param1获取
    	return string
    */
    if(Mock.valid(reqMockConfig, data).length === 0){
    	return JSON.stringify(Mock.mock(item));
    }else{
      // 捕捉到不符合规则的提交数据，进行相关业务处理
      return JSON.stringify({
        data: {},
        code: 8,
        msg: '提交数据有误'
      })
    }
  }
  ```