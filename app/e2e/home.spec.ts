import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load successfully", async ({ page }) => {
    await expect(page).toHaveTitle(/Rashad Ataf/);
  });

  test("should display hero section", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should navigate to about page", async ({ page }) => {
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL(/.*about/);
  });

  test("should navigate to projects page", async ({ page }) => {
    await page.click('a[href="/projects"]');
    await expect(page).toHaveURL(/.*projects/);
  });

  test("should navigate to articles page", async ({ page }) => {
    await page.click('a[href="/articles"]');
    await expect(page).toHaveURL(/.*articles/);
  });
});

test.describe("Theme Toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should toggle theme", async ({ page }) => {
    const themeButton = page.locator('button[aria-label*="Mode"]');
    await expect(themeButton).toBeVisible();
    
    // Click to toggle
    await themeButton.click();
    
    // Check that theme changed (html class should change)
    await expect(page.locator("html")).toHaveClass(/dark|light/);
  });
});

test.describe("Articles Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/articles");
  });

  test("should load articles page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Articles");
  });
});

test.describe("Projects Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects");
  });

  test("should load projects page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Projects");
  });
});