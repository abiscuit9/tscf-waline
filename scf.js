const waline = require('@waline-tscf/server');

// 导出云函数处理方法
exports.main_handler = (event, context) => {
  console.log('[函数] 收到新请求 - event参数:', JSON.stringify(event, null, 2));
  console.log('[函数] 收到新请求 - context参数:', JSON.stringify(context, null, 2));
  try {
    // 创建Waline实例并处理请求，传入完整的配置对象
    console.log('[函数] 转发请求到Waline');
    const response = waline({ 
      event,
      // 这里可以添加其他配置参数
      // database: {...},
      // secureDomains: [...],
      // 等等
    }); 
    
    console.log('[函数] 响应处理完成');
    console.log(JSON.stringify(response, null, 2));
    
    // 返回符合腾讯云函数规范的响应格式
    return {
      isBase64Encoded: false,  // 如果响应不是 base64 编码
      statusCode: response.statusCode,
      headers: {
        ...response.headers,
        'Content-Type': 'application/json',  // 确保设置正确的 Content-Type
      },
      body: typeof response.body === 'string' 
        ? response.body 
        : JSON.stringify(response.body || {})
    };

  } catch (err) {
    // 错误处理
    console.error('[函数] 请求处理失败:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: '服务器内部错误',
        details: err.message 
      })
    };
  }
};