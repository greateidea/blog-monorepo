import { test } from '@playwright/test';

test.use({ baseURL: 'http://localhost:3000' }); // 覆盖配置，指向 Admin
test('blog-index login', async ({ page }) => {
    await page.goto('/'); // 访问的是 3000
}); 