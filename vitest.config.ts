import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 【核心修复】
    // 强制根目录的 Runner 开启全局变量支持。
    // 这样，当 lint-staged 在根目录启动 Vitest 时，
    // 它就会先把 describe/it/expect 注入到环境中，
    // 防止在加载子项目配置前就报 ReferenceError。
    globals: true,
    
    // 显式指定环境（兜底用）
    environment: 'jsdom',
  },
});
