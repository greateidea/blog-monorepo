import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/wapi': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wapi/, ''),
      },
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // 把 react 和 react-dom 放到 framework（名字随意，但要能识别）
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'framework'
            } 
            // 其他 node_modules 按包名拆成 vendor-xxx（可选）
            // const pkgMatch = id.match(/node_modules\/([^\/]+)(\/|$)/)
            // if (pkgMatch) {
            //   return `vendor`
            // }
          }
        }
      }
    }
  }
}))
