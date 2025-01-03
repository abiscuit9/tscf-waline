

// HTML字符转义函数：将不安全的HTML字符转换为安全的实体字符
const escapeHtml = (unsafeHTML) => {
  think.logger.debug('【工具】执行HTML字符转义');
  return unsafeHTML
    .replace(/&/gu, '&amp;')     // 转义 & 字符
    .replace(/</gu, '&lt;')      // 转义 < 字符
    .replace(/>/gu, '&gt;')      // 转义 > 字符
    .replace(/"/gu, '&quot;')    // 转义 " 字符
    .replace(/'/gu, '&#039;');   // 转义 ' 字符
};

// 导出工具函数
module.exports = {
  escapeHtml,
};
