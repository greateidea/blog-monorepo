import viteConfig from './vite.config'; // 复用你现有的 Vite 配置(别名等)
import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '@blog/test-config'; // 引入公共配置

// 合并配置：Vite配置 + 公共测试配置 + 你的自定义配置
export default defineConfig(async (env) => {

    // 1. 解包 vite.config.ts
    // 如果 viteConfig 是一个函数（defineConfig(config => ...)），我们需要手动执行它来获取真正的配置对象
    // 我们把当前的 env (command, mode) 透传给它
    const resolvedViteConfig = typeof viteConfig === 'function' 
        ? await viteConfig(env) 
        : viteConfig;

    // 2. 解包 baseConfig (为了健壮性，防止未来 baseConfig 也变成函数)
    const resolvedBaseConfig = typeof baseConfig === 'function'
        ? await (baseConfig as Function)?.(env)
        : baseConfig;

    return mergeConfig(  
        resolvedViteConfig as any,
        mergeConfig(resolvedBaseConfig, {
            test: {
            // 你可以在这里覆盖公共配置，比如设置 setupFiles
            setupFiles: ['./src/test/setup.ts'],
        },
  }))
});
