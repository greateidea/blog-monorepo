import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'BlogUtils',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'umd.js'}`,
    },
    rollupOptions: {
      // 确保 React 等外部依赖不被打包进去
      external: ['react'],
      output: {
        globals: {
          react: 'React'
        }
      }
    }
  }
});