import viteConfig from './vite.config'; // 复用你现有的 Vite 配置(别名等)
import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '@blog/test-config'; // 引入公共配置

export default defineConfig(async (env) => {
  // 1. 解包 vite.config.ts (如果它是函数)
  const resolvedViteConfig = typeof viteConfig === 'function'
    ? await (viteConfig as Function)(env)
    : viteConfig;

  // 2. 解包 baseConfig (防御性编程)
  const resolvedBaseConfig = typeof baseConfig === 'function'
    ? await (baseConfig as Function)(env)
    : baseConfig;

  // 3. 安全合并
  return mergeConfig(
    resolvedViteConfig,
    mergeConfig(resolvedBaseConfig, {
      test: {
        // SSR 项目通常也需要 DOM 环境来测试组件
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'], // 如果你有这个文件的话
      },
    })
  );
});
