/**
 * Theme toggle tests
 *
 * Covers: initial theme detection, toggling between dark/light, persistence
 * across page navigations, and localStorage sync.
 */

import { test, expect } from "./fixtures.js";

test.describe("Theme toggle", () => {
  test("theme toggle button is present in the header", async ({ page }) => {
    await page.goto("/");
    // The toggle is rendered by ThemeToggle inside Header
    const toggle = page.locator(".header__actions button[aria-label], .header__actions button[title], .theme-toggle, button.theme-toggle");
    await expect(toggle).toBeVisible();
  });

  test("clicking the toggle switches the data-theme attribute", async ({ page }) => {
    // Start with a known state: force dark theme
    await page.goto("/");
    // Read the initial theme
    const initialTheme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );

    // Click the toggle
    const toggle = page.locator(".header__actions button").last();
    await toggle.click();

    const newTheme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(newTheme).not.toEqual(initialTheme);
    expect(["light", "dark"]).toContain(newTheme);
  });

  test("toggling twice returns to the original theme", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator(".header__actions button").last();
    const initialTheme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    await toggle.click();
    await toggle.click();
    const finalTheme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(finalTheme).toEqual(initialTheme);
  });

  test("theme is persisted to localStorage", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator(".header__actions button").last();
    await toggle.click();
    const themeInStorage = await page.evaluate(() =>
      window.localStorage.getItem("theme")
    );
    const themeOnDom = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(themeInStorage).toEqual(themeOnDom);
  });

  test("theme preference is restored on page reload", async ({ page }) => {
    await page.goto("/");
    // Force light theme
    await page.evaluate(() => window.localStorage.setItem("theme", "light"));
    await page.reload();
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toEqual("light");
  });

  test("theme preference is restored on page reload (dark)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.setItem("theme", "dark"));
    await page.reload();
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toEqual("dark");
  });

  test("theme persists when navigating between pages", async ({ page }) => {
    await page.goto("/");
    // Set a specific theme
    await page.evaluate(() => {
      window.localStorage.setItem("theme", "light");
      document.documentElement.setAttribute("data-theme", "light");
    });
    // Navigate to roadmap
    await page.click("nav a[href='/roadmap']");
    const themeOnRoadmap = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(themeOnRoadmap).toEqual("light");
    // Navigate back home
    await page.click("nav a[href='/']");
    const themeOnHome = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(themeOnHome).toEqual("light");
  });
});
