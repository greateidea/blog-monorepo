import viteConfig from './vite.config'; // 复用你现有的 Vite 配置(别名等)
import { mergeConfig } from 'vitest/config';
import baseConfig from '@blog/test-config'; // 引入公共配置

// 合并配置：Vite配置 + 公共测试配置 + 你的自定义配置
export default mergeConfig(
  viteConfig as any,
  mergeConfig(baseConfig, {
    test: {
      // 你可以在这里覆盖公共配置，比如设置 setupFiles
      setupFiles: ['./src/test/setup.ts'],
    },
  })
);
