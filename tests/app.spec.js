import { test, expect } from '@playwright/test';

/**
 * Reps 应用 E2E 测试
 * 
 * 测试场景：
 * 1. 登录页面加载
 * 2. 登录表单验证
 * 3. 未登录重定向到登录页
 * 4. 登录流程（需要真实账号）
 * 5. 核心页面导航
 */

test.describe('登录页面', () => {
  test('应该正确显示登录页面', async ({ page }) => {
    await page.goto('/login');
    
    // 检查页面标题
    await expect(page.locator('h1')).toContainText('Reps');
    
    // 检查表单元素存在
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // 检查登录按钮文本
    await expect(page.locator('button[type="submit"]')).toContainText('登录');
  });

  test('应该能切换登录/注册模式', async ({ page }) => {
    await page.goto('/login');
    
    // 初始状态是登录
    await expect(page.locator('button[type="submit"]')).toContainText('登录');
    
    // 点击切换到注册
    await page.click('text=注册');
    await expect(page.locator('button[type="submit"]')).toContainText('注册');
    
    // 再切换回登录
    await page.click('text=登录');
    await expect(page.locator('button[type="submit"]')).toContainText('登录');
  });

  test('空表单提交应该触发HTML验证', async ({ page }) => {
    await page.goto('/login');
    
    // 尝试提交空表单
    await page.click('button[type="submit"]');
    
    // 表单应该还在（没有跳转）
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('应该能输入邮箱和密码', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');
  });
});

test.describe('路由保护', () => {
  test('未登录访问首页应该重定向到登录', async ({ page }) => {
    await page.goto('/');
    
    // 应该被重定向到登录页或显示登录内容
    await page.waitForTimeout(2000); // 等待认证检查
    
    // 检查是否在登录页面或有登录相关内容
    const url = page.url();
    const hasLoginContent = await page.locator('input[type="email"]').isVisible().catch(() => false);
    
    expect(url.includes('login') || hasLoginContent).toBeTruthy();
  });

  test('未登录访问 /stats 应该重定向到登录', async ({ page }) => {
    await page.goto('/stats');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    const hasLoginContent = await page.locator('input[type="email"]').isVisible().catch(() => false);
    
    expect(url.includes('login') || hasLoginContent).toBeTruthy();
  });
});

test.describe('页面基础加载', () => {
  test('登录页面无 JavaScript 错误', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    
    await page.goto('/login');
    await page.waitForTimeout(1000);
    
    // 过滤掉一些常见的非关键错误
    const criticalErrors = errors.filter(e => 
      !e.includes('ResizeObserver') && 
      !e.includes('favicon')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('登录页面无网络请求失败（除了 Supabase 认证）', async ({ page }) => {
    const failedRequests = [];
    
    page.on('requestfailed', (request) => {
      const url = request.url();
      // 忽略 Supabase 和一些预期的失败
      if (!url.includes('supabase') && !url.includes('favicon')) {
        failedRequests.push(url);
      }
    });
    
    await page.goto('/login');
    await page.waitForTimeout(2000);
    
    expect(failedRequests).toHaveLength(0);
  });
});

test.describe('响应式设计', () => {
  test('移动端视口下登录页应该正常显示', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/login');
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('平板视口下登录页应该正常显示', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/login');
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
