// 引入基础逻辑类
const Base = require('../base.js');


module.exports = class extends Base {
  // 更新密码的处理方法
  async putAction() {
    think.logger.debug('【密码】设置密码更新的验证规则');

    // 设置请求参数的验证规则
    this.rules = {
      email: {
        required: true,    // 邮箱为必填项
      },
    };
  }
};
