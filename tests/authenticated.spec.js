import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_EMAIL || '';
const TEST_PASSWORD = process.env.TEST_PASSWORD || '';

async function login(page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('/', { timeout: 10000 });
  
  await page.evaluate(() => {
    localStorage.setItem('reps_onboarding_completed', 'true');
  });
  
  const modal = page.locator('.modal-overlay');
  if (await modal.isVisible({ timeout: 1000 }).catch(() => false)) {
    const skipBtn = page.locator('button:has-text("跳过")');
    if (await skipBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await skipBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);
  }
}

test.describe('登录流程', () => {
  test('使用有效账号登录成功', async ({ page }) => {
    await login(page);
    
    const tabBar = page.locator('nav.tab-bar');
    await expect(tabBar).toBeVisible({ timeout: 5000 });
  });

  test('错误密码应该保持在登录页', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    expect(page.url()).toContain('login');
  });
});

test.describe('Today 页面', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('主页正确加载', async ({ page }) => {
    await expect(page.locator('nav.tab-bar')).toBeVisible();
  });

  test('导航栏有6个链接', async ({ page }) => {
    await expect(page.locator('nav.tab-bar a')).toHaveCount(6);
  });
});

test.describe('页面导航', () => {
  test('可以导航到所有页面', async ({ page }) => {
    await login(page);
    
    const pages = ['/templates', '/stats', '/achievements', '/history', '/settings'];
    
    for (const path of pages) {
      await page.locator(`a[href="${path}"]`).click();
      await page.waitForTimeout(500);
      expect(page.url()).toContain(path);
      
      await page.locator('a[href="/"]').click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('设置页面', () => {
  test('有退出登录按钮', async ({ page }) => {
    await login(page);
    await page.locator('a[href="/settings"]').click();
    await page.waitForTimeout(1000);
    
    const logoutBtn = page.locator('button:has-text("退出")');
    await expect(logoutBtn.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('错误检测', () => {
  test('主页无严重 JS 错误', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    
    await login(page);
    await page.waitForTimeout(2000);
    
    const critical = errors.filter(e => !e.includes('ResizeObserver'));
    expect(critical).toHaveLength(0);
  });
});
