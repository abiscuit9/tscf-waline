// 引入模板引擎用于渲染字符串
const nunjucks = require('nunjucks');
// 引入密码哈希工具
const { PasswordHash } = require('phpass');


// 引入默认语言包
const defaultLocales = require('../locales/index.js');

// 设置默认语言为英语
const defaultLang = 'en-us';

module.exports = {
  // 处理成功响应的方法
  success(...args) {
    think.logger.debug('【控制器】发送成功响应');
    this.ctx.success(...args);
    return think.prevent();
  },

  // 处理失败响应的方法
  fail(...args) {
    think.logger.debug('【控制器】发送失败响应');
    this.ctx.fail(...args);
    return think.prevent();
  },

  // 根据兼容模式返回不同格式的成功响应
  jsonOrSuccess(...args) {
    think.logger.debug('【控制器】根据兼容模式返回响应');
    return this[this.ctx.state.deprecated ? 'json' : 'success'](...args);
  },

  // 处理多语言消息的方法
  locale(message, variables) {
    // 获取用户语言设置，默认使用英语
    const { lang: userLang } = this.get();
    const lang = (userLang || defaultLang).toLowerCase();

    think.logger.debug('【控制器】处理多语言消息，当前语言:', lang);

    // 获取自定义语言包，如果没有则使用默认语言包
    const customLocales = this.config('locales');
    const locales = customLocales || defaultLocales;

    // 按优先级查找对应的语言消息：
    // 1. 自定义语言包中的当前语言
    // 2. 默认语言包中的当前语言
    // 3. 默认语言包中的英语
    const localMessage =
      locales?.[lang]?.[message] ||
      defaultLocales?.[lang]?.[message] ||
      defaultLocales[defaultLang][message];

    if (localMessage) {
      message = localMessage;
    }

    // 使用模板引擎渲染消息
    return nunjucks.renderString(message, variables);
  },

  // 获取数据模型实例的方法
  getModel(modelName) {
    const { storage, customModel } = this.config();
    think.logger.debug('【控制器】获取数据模型:', modelName);

    // 如果配置了自定义模型处理函数，优先使用
    if (typeof customModel === 'function') {
      const modelInstance = customModel(modelName, this);

      if (modelInstance) {
        think.logger.debug('【控制器】使用自定义数据模型');
        return modelInstance;
      }
    }

    // 使用默认存储服务的模型
    think.logger.debug('【控制器】使用默认存储模型');
    return this.service(`storage/${storage}`, modelName);
  },

  // 密码加密方法
  hashPassword(password) {
    think.logger.debug('【控制器】执行密码加密');
    // 获取配置的密码加密类或使用默认加密类
    const PwdHash = this.config('encryptPassword') || PasswordHash;
    const pwdHash = new PwdHash();

    return pwdHash.hashPassword(password);
  },

  // 密码验证方法
  checkPassword(password, storeHash) {
    think.logger.debug('【控制器】验证密码');
    // 获取配置的密码加密类或使用默认加密类
    const PwdHash = this.config('encryptPassword') || PasswordHash;
    const pwdHash = new PwdHash();

    return pwdHash.checkPassword(password, storeHash);
  },

  json(...args) {
    think.logger.debug('【控制器】调用 json 方法');
    think.logger.debug('【控制器】json 参数:', JSON.stringify(args));
    
    const result = super.json(...args);
    
    think.logger.debug('【控制器】json 结果:', JSON.stringify(result));
    return result;
  }
};
