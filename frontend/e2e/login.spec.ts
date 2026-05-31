import { test, expect } from '@playwright/test';

test('debe mostrar la página de login', async ({ page }) => {
  await page.goto('/login');
  
  await expect(page.locator('h1')).toContainText('Iniciar Sesión');
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test('debe mostrar error con credenciales inválidas', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.error')).toBeVisible();
});
