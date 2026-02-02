import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import pkg from '../../package.json';
import { sentryVitePlugin } from "@sentry/vite-plugin";
// import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  const releaseName = `${pkg.name.replace('@', '').replace('/', '-')}@${pkg.version}`;


  return {
    build: {
      assetsDir: 'index-assets',
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
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
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      tailwindcss(),
      mode === 'production' && sentryVitePlugin({
        org: env.ORG_SLUG || 'cybernetic-nerve', // Sentry 组织名
        project: env.PROJECT_SLUG || 'cybernetic-nerve-index-react', // Sentry 项目名
        telemetry: false,
        authToken: env.SENTRY_AUTH_TOKEN,
        // 【关键】Release 版本必须和 main.tsx 里的一致！
        release: {
          name: releaseName,
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.SENTRY_RELEASE': JSON.stringify(releaseName),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
