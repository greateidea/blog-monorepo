// 直接引用我们配置包里的预设
const config = require("./packages/eslint-config/prettier-preset");

module.exports = {
    ...config,
};