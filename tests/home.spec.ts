/**
 * Home page tests
 *
 * Covers: hero section, featured talk section, talks grid, feature cards, CTA.
 * All network calls are intercepted by the shared fixture (no real HTTP).
 */

import { test, expect } from "./fixtures.js";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // ── Hero ──────────────────────────────────────────────────────────────────

  test("renders the hero title and lead text", async ({ page }) => {
    await expect(page.locator("h1.hero__title")).toBeVisible();
    await expect(page.locator(".hero__lead")).toBeVisible();
  });

  test("hero eyebrow shows site domain", async ({ page }) => {
    await expect(page.locator(".hero__eyebrow")).toHaveText("dharmalibrary.link");
  });

  test('"Start reading" button navigates to talk detail', async ({ page }) => {
    await page.click("text=Start reading");
    await expect(page).toHaveURL(/\/talk\//);
    await expect(page.locator("article.talk-detail")).toBeVisible();
  });

  test('"See what\'s coming" button navigates to roadmap', async ({ page }) => {
    await page.click("text=See what's coming");
    await expect(page).toHaveURL("/roadmap");
  });

  // ── Featured talk ─────────────────────────────────────────────────────────

  test("featured talk section renders with a title", async ({ page }) => {
    // The featured talk eyebrow must be present.
    await expect(page.locator("text=Featured talk")).toBeVisible();
    // A talk title (h2 inside the featured section) must appear.
    const featuredArticle = page.locator("article.featured-talk");
    await expect(featuredArticle).toBeVisible();
    const title = featuredArticle.locator("h2");
    await expect(title).not.toBeEmpty();
  });

  test("featured talk shows audio pill", async ({ page }) => {
    const featuredArticle = page.locator("article.featured-talk");
    await expect(featuredArticle).toBeVisible();
    await expect(featuredArticle.locator(".pill", { hasText: "Audio" })).toBeVisible();
  });

  test('"Go to talk page" in featured talk navigates to talk detail', async ({ page }) => {
    const featuredArticle = page.locator("article.featured-talk");
    await expect(featuredArticle).toBeVisible();
    await featuredArticle.locator("button", { hasText: "Go to talk page" }).click();
    await expect(page).toHaveURL(/\/talk\//);
    await expect(page.locator("article.talk-detail")).toBeVisible();
  });

  // ── Talks list ────────────────────────────────────────────────────────────

  test("talks list grid is rendered with cards", async ({ page }) => {
    const grid = page.locator(".cards-grid").first();
    await expect(grid).toBeVisible();
    const cards = grid.locator("article.talk-card");
    await expect(cards.first()).toBeVisible();
  });

  test("results count label is shown", async ({ page }) => {
    await expect(page.locator(".results-count")).toBeVisible();
  });

  // ── Feature cards ─────────────────────────────────────────────────────────

  test('feature section "Thoughtful features on the way" is present', async ({ page }) => {
    await expect(page.locator("text=Thoughtful features on the way")).toBeVisible();
  });

  test("all three feature cards are rendered", async ({ page }) => {
    const featureSection = page.locator(".features");
    await expect(featureSection).toBeVisible();
    await expect(featureSection.locator("article.feature-card")).toHaveCount(3);
  });

  // ── CTA ───────────────────────────────────────────────────────────────────

  test("CTA section with email link is present", async ({ page }) => {
    await expect(page.locator("text=Want your talks included?")).toBeVisible();
    const emailLink = page.locator('a[href="mailto:hello@dharmalibrary.link"]');
    await expect(emailLink).toBeVisible();
  });
});
