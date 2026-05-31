import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Login antes de cada test
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
});

test('debe mostrar el dashboard', async ({ page }) => {
  await expect(page.locator('h2')).toContainText('Salud de Inventario');
});

test('debe mostrar métricas de KPI', async ({ page }) => {
  await expect(page.locator('text=Stock Crítico')).toBeVisible();
  await expect(page.locator('text=Agotados')).toBeVisible();
  await expect(page.locator('text=Valor Total Stock')).toBeVisible();
});

test('debe navegar a productos', async ({ page }) => {
  await page.click('text=Productos');
  await page.waitForURL('/products');
  await expect(page.locator('h2')).toContainText('Gestión de Productos');
});
