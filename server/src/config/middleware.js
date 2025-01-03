// 导入必要的中间件模块
const cors = require('@koa/cors');
const routerREST = require('think-router-rest');
const { isNetlify, netlifyFunctionPrefix } = require('./netlify.js');

// 环境变量检查
const isDev = think.env === 'development';
const isTcb = think.env === 'cloudbase';
const isSCF = think.env === 'scf' || process.env.TENCENTCLOUD_RUNENV === 'SCF';
const isDeta = think.env === 'deta' || process.env.DETA_RUNTIME === 'true';
const isAliyunFC = think.env === 'aliyun-fc' || Boolean(process.env.FC_RUNTIME_VERSION);

think.logger.debug('[中间件] 检测运行环境', {
  isDev,
  isTcb,
  isSCF,
  isDeta,
  isAliyunFC,
  isNetlify
});

// 中间件配置数组
module.exports = [
  // 管理界面中间件 - 处理UI路由
  {
    handle: 'dashboard',
    match: isNetlify ? new RegExp(`${netlifyFunctionPrefix}/ui`, 'i') : /^\/ui/,
  },

  // API前缀警告中间件 - 检查API路径前缀
  {
    handle: 'prefix-warning',
  },

  // 元信息中间件 - 处理请求元数据
  {
    handle: 'meta',
    options: {
      logRequest: isDev,
      sendResponseTime: isDev,
      requestTimeoutCallback:
      isTcb || isSCF || isDeta || isAliyunFC || isNetlify ? false : () => {
          think.logger.debug('[中间件] 检测到请求超时');
        },
    },
  },

  // 版本信息中间件 - 添加版本信息
  {
    handle: 'version',
  },

  // CORS中间件 - 处理跨域请求
  { handle: cors },

  // 请求追踪中间件 - 处理请求日志和错误
  {
    handle: 'trace',
    enable: !think.isCli,
    options: {
      debug: true,
      contentType: () => 'json',
      error(err, ctx) {
        if (/favicon.ico$/.test(ctx.url)) {
          return;
        }
        if (think.isPrevent(err)) {
          return false;
        }

        think.logger.debug('[中间件] 请求处理发生错误:', err);
      },
    },
  },

  // 请求体解析中间件 - 处理请求数据
  {
    handle: 'payload',
    options: {
      keepExtensions: true,
      limit: '5mb',
    },
  },

  // 路由中间件 - 处理API路由
  {
    handle: 'router',
    options: {
      prefix: ['/api', `${netlifyFunctionPrefix}/api`, netlifyFunctionPrefix],
    },
  },

  // REST路由中间件 - 处理RESTful API
  { handle: routerREST },

  // 逻辑处理中间件
  'logic',
  
  // 插件中间件 - 处理插件功能
  {
    handle: 'plugin',
  },
  
  // 控制器中间件
  'controller',
];
