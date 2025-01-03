// 引入Node.js内置模块
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');

// 引入ThinkJS框架相关模块
const Application = require('thinkjs');
const Loader = require('thinkjs/lib/loader');

// 导出服务器初始化函数
module.exports = function(configParams = {}) {
  const { event, context , ...config } = configParams;
  // 创建ThinkJS应用实例
  const app = new Application({
    ROOT_PATH: __dirname,
    APP_PATH: path.join(__dirname, 'src'),
    VIEW_PATH: path.join(__dirname, 'view'),
    RUNTIME_PATH: '/tmp',
    proxy: false,
    env: 'scf'
  });
  // 加载应用配置
  const loader = new Loader(app.options);
  loader.loadAll('worker');
  for (const k in config) {
    // fix https://github.com/walinejs/waline/issues/2649 with alias model config name
    think.config(k === 'model' ? 'customModel' : k, config[k]);
  }
  think.logger.debug('【waline】应用实例已创建');

  // 创建Node.js HTTP服务器
  const server = http.createServer();
  think.logger.debug('【waline】HTTP服务器实例已创建');
  
  // 构造请求对象
  const req = new http.IncomingMessage(server);
  Object.assign(req, {
    method: event.httpMethod,
    url: `${event.path}${event.queryString ? '?' + new URLSearchParams(event.queryString).toString() : ''}`,
    headers: event.headers || {},
    query: event.queryString || {},
    body: event.body,
    socket: {
      remoteAddress: event.headers['x-scf-remote-addr'] || ''
    }
  });
   // 构造响应对象
  const res = new http.ServerResponse(req);
  console.log('【waline】构造请求:', JSON.stringify(req, null, 2));
  // 处理请求并返回响应
  return handleRequest(req, res);
};

async function handleRequest(req, res) {
  // 保存原始的 res.end
  const originalEnd = res.end;
  
  // 创建一个 Promise 来处理响应
  return new Promise((resolve) => {
    res.end = function(data) {
      // 恢复原始的 res.end
      res.end = originalEnd;
      
      resolve({
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        body: data
      });
    };
    
    // 初始化服务器
    think.beforeStartServer();
    think.logger.debug('【waline】开始处理请求');
    
    // 执行请求处理
    const callback = think.app.callback();
    callback(req, res).then(() => {
      think.logger.debug('【waline】请求处理完成');
      think.app.emit('appReady');
      think.logger.debug('【waline】应用待机中');
    });
  });
}
