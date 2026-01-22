/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 【核心】模拟浏览器环境 (RTL 必须)
    environment: 'jsdom',
    
    // 全局变量 (如 describe, it, expect) 不用手动 import
    globals: true,
    
    // 设置测试文件的超时时间
    testTimeout: 10000,
    
    // 覆盖率配置 (可选)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
