

// 下一个主版本将废弃的路由前缀列表
const DEPRECATE_ROUTER_NEXT_VERSION = [
  '/article',
  '/comment',
  '/db',
  '/oauth',
  '/token',
  '/user',
  '/verification',
  '/token/2fa',
  '/user/password',
];

// 导出路由前缀检查中间件
module.exports = () => async (ctx, next) => {
  think.logger.debug('【路由】检查API路径是否使用了即将废弃的前缀');

  // 检查当前请求路径是否使用了旧的API格式
  ctx.state.deprecated = DEPRECATE_ROUTER_NEXT_VERSION.some((prefix) => {
    const oldAPI = new RegExp(`${prefix}$`, 'i');
    const newAPI = new RegExp(`/api${prefix}$`, 'i');

    return !newAPI.test(ctx.path) && oldAPI.test(ctx.path);
  });

  // 如果使用了即将废弃的API，输出警告信息
  if (ctx.state.deprecated) {
    think.logger.debug('【路由】检测到使用了即将废弃的API路径:', ctx.path);
    think.logger.warn(
      `[已废弃] ${ctx.path} API将在下一个主版本中废弃，请不要继续使用。如果您正在使用 \`@waline/client\`，请升级到 \`@waline/client@3\`。对于其他场景，您可以使用 \`/api${ctx.path}\` 来替代。`,
    );
  }

  await next();
};
