// Netlify配置 - 处理Netlify环境相关配置

// 判断是否为Netlify环境
exports.isNetlify = think.env === 'netlify';

// 获取Netlify函数前缀 - 从环境变量中提取处理器名称并构建路径
exports.netlifyFunctionPrefix = `/.netlify/functions/${process.env?._HANDLER?.replace(
  /\.handler$/,
  '',
)}`;

think.logger.debug('[Netlify] 当前环境配置', {
  isNetlify: exports.isNetlify,
  functionPrefix: exports.netlifyFunctionPrefix
});
