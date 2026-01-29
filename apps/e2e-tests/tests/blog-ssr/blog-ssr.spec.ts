import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://localhost:5173' }); // 覆盖配置，指向 Blog
// test('read post', async ({ page }) => {
//     await page.goto('/'); // 访问的是 5173
// }); 

test('使用Podman命令创建和启动容器', async ({ page }) => {
  // 1. 访问首页 (自动使用 baseURL)
  await page.goto('/podman-start');

  // 这相当于用户疯狂滑动滚轮直到滑不动为止，此时上层元素会移开
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  // 2. 像用户一样操作
  // 3. (可选但推荐) 等待一小会儿或断言元素可见
  // 如果揭示效果有 CSS transition (比如 0.3s)，这一步很重要
  const link = page.getByRole('link', { name: 'Podman的服务持久化' });
  await expect(link).toBeVisible();

  // 4. 现在点击，就不会被遮挡了
  await link.click();

  // 5. 断言：URL 应该变了，或者看到了文章列表
  await expect(page).toHaveURL(/.*podman-persistence/);
  await expect(page.getByText('Podman的服务持久化')).toBeVisible();
});