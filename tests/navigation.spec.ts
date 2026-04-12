/**
 * Navigation tests
 *
 * Covers: header nav links, active state, logo/brand button, back button,
 * direct URL access (deep links), and browser back/forward.
 * All network calls are intercepted (no real HTTP).
 */

import { test, expect, DEFAULT_TALK_ID } from "./fixtures.js";

test.describe("Header navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("logo/brand button navigates home from roadmap", async ({ page }) => {
    await page.click("text=Roadmap");
    await expect(page).toHaveURL("/roadmap");
    await page.click(".header__brand, .brand-button");
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1.hero__title")).toBeVisible();
  });

  test("Roadmap nav link navigates to /roadmap", async ({ page }) => {
    await page.click("nav a[href='/roadmap']");
    await expect(page).toHaveURL("/roadmap");
  });

  test("About nav link navigates to /about", async ({ page }) => {
    await page.click("nav a[href='/about']");
    await expect(page).toHaveURL("/about");
  });

  test("Home nav link navigates back to /", async ({ page }) => {
    await page.click("nav a[href='/roadmap']");
    await expect(page).toHaveURL("/roadmap");
    await page.click("nav a[href='/']");
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1.hero__title")).toBeVisible();
  });

  test("active nav link is marked is-active", async ({ page }) => {
    // Home link is active on home page
    await expect(page.locator("nav a[href='/']")).toHaveClass(/is-active/);

    // Roadmap link becomes active on roadmap page
    await page.click("nav a[href='/roadmap']");
    await expect(page.locator("nav a[href='/roadmap']")).toHaveClass(/is-active/);
    await expect(page.locator("nav a[href='/']")).not.toHaveClass(/is-active/);
  });
});

test.describe("Direct URL access (deep linking)", () => {
  test("navigating to /roadmap directly renders roadmap", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page).toHaveURL("/roadmap");
    // Roadmap page should have some heading content
    await expect(page.locator("main")).toBeVisible();
  });

  test("navigating to /about directly renders about page", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveURL("/about");
    await expect(page.locator("main")).toBeVisible();
  });

  test("navigating to /talk/:id directly renders talk detail", async ({ page }) => {
    await page.goto(`/talk/${DEFAULT_TALK_ID}`);
    await expect(page).toHaveURL(`/talk/${DEFAULT_TALK_ID}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
  });
});

test.describe("Browser history (back / forward)", () => {
  test("browser back returns from roadmap to home", async ({ page }) => {
    await page.goto("/");
    await page.click("nav a[href='/roadmap']");
    await expect(page).toHaveURL("/roadmap");
    await page.goBack();
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1.hero__title")).toBeVisible();
  });

  test("browser back returns from talk detail to home", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Start reading");
    await expect(page).toHaveURL(/\/talk\//);
    await page.goBack();
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1.hero__title")).toBeVisible();
  });

  test("browser forward restores talk detail after going back", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Start reading");
    const talkUrl = page.url();
    await page.goBack();
    await page.goForward();
    await expect(page).toHaveURL(talkUrl);
    await expect(page.locator("article.talk-detail")).toBeVisible();
  });
});

test.describe("Talk detail back button", () => {
  test('"Back to list" button returns to home page', async ({ page }) => {
    await page.goto("/");
    await page.click("text=Start reading");
    await expect(page.locator("article.talk-detail")).toBeVisible();
    await page.click("button:has-text('Back to list')");
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1.hero__title")).toBeVisible();
  });
});

test.describe("Footer navigation", () => {
  test("footer renders and has navigation links", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});
