import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        // 【关键】自动生成 .d.ts 类型文件，且将类型文件输出到 dist
        dts({
            insertTypesEntry: true,
            rollupTypes: true // 可选：合并类型文件
        }),
    ],
    build: {
        lib: {
            // 入口文件
            entry: path.resolve(__dirname, 'src/index.ts'),
            // 库名称（UMD用）
            name: 'BlogUILib',
            // 输出文件名格式
            fileName: (format) => `index.${format === 'es' ? 'mjs' : 'umd.js'}`,
        },
        rollupOptions: {
            // 【绝对关键】确保外部化处理那些你不想打包进库的依赖
            external: ['react', 'react-dom'],
            output: {
                // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
});
