import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { sentryVitePlugin } from "@sentry/vite-plugin"
import pkg from '../../package.json'
// import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  const releaseName = `${pkg.name.replace('@', '').replace('/', '-')}@${pkg.version}`;

  return {
    plugins: [
      react(),
      // tailwindcss()
      // 【核心】只在生产构建时运行 Sentry 上传
      // @ts-expect-error - Vite version mismatch in monorepo causing type issues
      mode === 'production' && sentryVitePlugin({
        org: env.ORG_SLUG, // Sentry 组织名
        project: env.PROJECT_SLUG, // Sentry 项目名
        telemetry: false,
        authToken: env.SENTRY_AUTH_TOKEN,
        // 【关键】Release 版本必须和 main.tsx 里的一致！
        release: {
          name: releaseName,
        }
      }),
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
              } if (id.includes('sentry')) {
                return 'tracking'
              } else {
                return 'vendor'
              }
            }
          }
        }
      },
      sourcemap: true
    },
    'import.meta.env.SENTRY_RELEASE': JSON.stringify(releaseName),
  }
})
