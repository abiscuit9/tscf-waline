

// 引入包信息获取版本号
const pkg = require('../../package.json');

// 导出版本信息中间件
module.exports = () => async (ctx, next) => {
  think.logger.debug('【版本】添加Waline版本信息到响应头:', pkg.version);
  // 在响应头中添加Waline版本号
  ctx.set('x-waline-version', pkg.version);
  await next();
};
