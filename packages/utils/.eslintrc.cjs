module.exports = {
    root: true, // 停止向上查找，以此为根
    rules: {
        "no-useless-escape": "off",
        "@typescript-eslint/no-explicit-any": "off",
    }, 
    extends: ["@blog/eslint-config"], // 继承我们在 packages/eslint-config 里写的规则
};