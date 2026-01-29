import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true, // 并行执行，快！
  reporter: 'html',    // 生成漂亮的 HTML 报告
  
  // 【核心：自动启动你的应用】
  // 告诉 Playwright，测试开始前，先帮我把 web-admin 跑起来
  webServer: [
    // {
    //   command: 'pnpm --filter @blog/SpringCatTech-blog dev',
    //   port: 3000,
    //   reuseExistingServer: !process.env.CI,
    //   stdout: 'ignore',
    //   stderr: 'pipe',
    // },
    {
      command: 'pnpm --filter @blog/blog-ssr dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
    }],

  use: {
    baseURL: 'http://localhost:5173', // 测试的基础路径
    trace: 'on-first-retry', // 第一次失败时录像
  },

//   projects: [
//     { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
//     // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
//     // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
//   ],
    /**
     * 只测 index：pnpm exec playwright test --project=index
     * 只测 ssr：pnpm exec playwright test --project=ssr
     * 全测：pnpm exec playwright test
     */
    projects: [
        {
            name: 'index', // 运行命令：npx playwright test --project=index
            testDir: './tests/blog-index', // 只跑这个目录下的测试
            use: {
                baseURL: 'http://localhost:3000', // 这里的测试全走 3000
            },
        },
        {
            name: 'ssr', // 运行命令：npx playwright test --project=ssr
            testDir: './tests/blog-ssr',
            use: {
                baseURL: 'http://localhost:5173', // 这里的测试全走 5173
            },
        },
    ],
});