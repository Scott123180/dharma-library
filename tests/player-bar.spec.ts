/**
 * PlayerBar tests
 *
 * Covers: the global persistent audio player bar that appears when a talk is
 * popped out, its content (title / speaker), close button behaviour, and
 * survival across page navigation.
 *
 * NOTE: Browsers block autoplay without user interaction. These tests verify
 * DOM state (player bar appears / disappears) but do not assert that audio is
 * actually playing, because headless Chromium will silently block it.
 */

import { test, expect } from "./fixtures.js";

const TALK_WITH_AUDIO = { id: "24526", title: "Perfection of Giving", teacher: "John Daido Loori" };

test.describe("PlayerBar — appearance", () => {
  test("player bar is not visible on initial load", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".player-bar")).not.toBeVisible();
  });

  test("clicking 'Pop out mini player' on a talk detail shows the player bar", async ({ page }) => {
    await page.goto(`/talk/${TALK_WITH_AUDIO.id}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
    await page.click("button:has-text('Pop out mini player')");
    await expect(page.locator(".player-bar")).toBeVisible();
  });

  test("player bar displays the talk title", async ({ page }) => {
    await page.goto(`/talk/${TALK_WITH_AUDIO.id}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
    await page.click("button:has-text('Pop out mini player')");
    await expect(page.locator(".player-bar__title")).toContainText(TALK_WITH_AUDIO.title);
  });

  test("player bar displays the speaker name", async ({ page }) => {
    await page.goto(`/talk/${TALK_WITH_AUDIO.id}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
    await page.click("button:has-text('Pop out mini player')");
    await expect(page.locator(".player-bar__meta")).toContainText(TALK_WITH_AUDIO.teacher);
  });

  test("player bar contains an audio element", async ({ page }) => {
    await page.goto(`/talk/${TALK_WITH_AUDIO.id}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
    await page.click("button:has-text('Pop out mini player')");
    await expect(page.locator(".player-bar audio, .player-bar__audio")).toBeVisible();
  });
});

test.describe("PlayerBar — close button", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/talk/${TALK_WITH_AUDIO.id}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
    await page.click("button:has-text('Pop out mini player')");
    await expect(page.locator(".player-bar")).toBeVisible();
  });

  test("close button is present with accessible aria-label", async ({ page }) => {
    const closeBtn = page.locator(".player-bar__close");
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toHaveAttribute("aria-label", "Close player");
  });

  test("clicking the close button hides the player bar", async ({ page }) => {
    await page.click(".player-bar__close");
    await expect(page.locator(".player-bar")).not.toBeVisible();
  });
});

test.describe("PlayerBar — persistence across navigation", () => {
  test("player bar survives navigating away from the talk detail page", async ({ page }) => {
    // Open a talk and pop out the player
    await page.goto(`/talk/${TALK_WITH_AUDIO.id}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
    await page.click("button:has-text('Pop out mini player')");
    await expect(page.locator(".player-bar")).toBeVisible();

    // Navigate to roadmap — player bar should still be visible
    await page.click("nav a[href='/roadmap']");
    await expect(page).toHaveURL("/roadmap");
    await expect(page.locator(".player-bar")).toBeVisible();
  });

  test("player bar survives navigating back to home", async ({ page }) => {
    await page.goto(`/talk/${TALK_WITH_AUDIO.id}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
    await page.click("button:has-text('Pop out mini player')");
    await expect(page.locator(".player-bar")).toBeVisible();

    await page.click("button:has-text('Back to list')");
    await expect(page).toHaveURL("/");
    await expect(page.locator(".player-bar")).toBeVisible();
  });
});

test.describe("PlayerBar — pop out from featured talk", () => {
  test("'Pop out mini player' in featured talk section opens the player bar", async ({ page }) => {
    await page.goto("/");
    const featuredSection = page.locator("article.featured-talk");
    await expect(featuredSection).toBeVisible();
    // The featured talk audio card has a "Pop out mini player" button
    const popOutBtn = featuredSection.locator("button:has-text('Pop out mini player')");
    await expect(popOutBtn).toBeVisible();
    await popOutBtn.click();
    await expect(page.locator(".player-bar")).toBeVisible();
  });
});
