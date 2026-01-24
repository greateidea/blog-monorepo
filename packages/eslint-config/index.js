module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:turbo/recommended", // TurboRepo 专用规则
        "prettier" // 【关键】必须放在最后，用于关闭所有和 Prettier 冲突的格式化规则
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
    },
    plugins: ["react", "@typescript-eslint", "import"],
    settings: {
        react: {
            version: "detect", // 自动检测 React 版本
        },
    },
    rules: {
        "react/react-in-jsx-scope": "off", // React 17+ 不需要显式 import React
        "@typescript-eslint/no-explicit-any": "off", // 允许 any 但警告
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
        "turbo/no-undeclared-env-vars": "warn", // 环境变量检查
        "react-hooks/exhaustive-deps": "off", // React Hooks 依赖检查
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": "off",
        // 关闭 prop-types 检查
        // 因为我们用 TypeScript，不再需要 runtime 的 prop-types 验证
        "react/prop-types": "off",
        // 如果你不需要强制写 displayName
        "react/display-name": "off", 
        // 允许在 JSX 中直接写 ' 而不需要写成 &apos;
        "react/no-unescaped-entities": "off",
    },
    ignorePatterns: ["dist", ".turbo", "node_modules"]
};